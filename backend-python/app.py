from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend access

def parse_hp(power_str):
    """Parses HP float value from strings like '0.5 HP', '10.0 HP', etc."""
    try:
        if power_str is None:
            return 1.0
        match = re.search(r'\d+(?:\.\d+)?', str(power_str))
        if match:
            return float(match.group(0))
        return 1.0
    except Exception:
        return 1.0

def parse_num(val_str):
    """Parses first numerical value from a string."""
    try:
        if val_str is None:
            return 0.0
        match = re.search(r'\d+(?:\.\d+)?', str(val_str))
        if match:
            return float(match.group(0))
        return 0.0
    except Exception:
        return 0.0

@app.route('/recommend', methods=['POST'])
def recommend_pumps():
    """
    Ranks and recommends pumps based on operating head, flow rate, and application.
    Expected request body:
    {
      "products": [...list of product objects...],
      "requirements": {
         "head": float (meters),
         "flow": float (LPM),
         "application": string (optional, e.g. "residential"),
         "dailyHours": float (optional, default 4.0),
         "electricityRate": float (optional, default 7.0)
      }
    }
    """
    data = request.get_json() or {}
    products = data.get('products') or []
    if not isinstance(products, list):
        products = []
    reqs = data.get('requirements') or {}
    if not isinstance(reqs, dict):
        reqs = {}
    
    try:
        target_head = float(reqs.get('head') or 0)
    except (TypeError, ValueError):
        target_head = 0.0

    try:
        target_flow = float(reqs.get('flow') or 0)
    except (TypeError, ValueError):
        target_flow = 0.0

    app_filter = str(reqs.get('application') or 'all').lower()

    daily_hours_val = reqs.get('dailyHours')
    if daily_hours_val is None or daily_hours_val == '':
        daily_hours = 4.0
    else:
        try:
            daily_hours = float(daily_hours_val)
        except (TypeError, ValueError):
            daily_hours = 4.0

    electricity_rate_val = reqs.get('electricityRate')
    if electricity_rate_val is None or electricity_rate_val == '':
        electricity_rate = 7.0
    else:
        try:
            electricity_rate = float(electricity_rate_val)
        except (TypeError, ValueError):
            electricity_rate = 7.0

    if target_head <= 0 or target_flow <= 0:
        return jsonify({
            "error": "Head and flow rate must be greater than zero.",
            "recommendations": []
        }), 400

    # Calculate theoretical hydraulic work (Water Horsepower - WHP)
    # WHP = (Flow in LPM * Head in Meters) / 4500  (metric water horsepower formula)
    water_hp = (target_flow * target_head) / 4500.0
    
    # Estimate required brake horsepower (BHP) at motor shaft assuming 60% pump efficiency
    estimated_efficiency = 0.60
    required_bhp = water_hp / estimated_efficiency

    recommendations = []

    for prod in products:
        if not isinstance(prod, dict):
            continue
        prod_category = str(prod.get('category') or '').lower()
        
        # Filter by application category
        if app_filter != 'all' and prod_category != app_filter:
            continue
            
        # Extract specs
        specs = prod.get('specs') or {}
        if not isinstance(specs, dict):
            specs = {}
        motor_power_str = str(specs.get('Motor Power') or '0 HP')
        discharge_vol_str = str(specs.get('Discharge Vol') or '0 LPM')
        max_head_str = str(specs.get('Max Head') or '0 Meters')

        pump_hp = parse_hp(motor_power_str)
        pump_max_flow = parse_num(discharge_vol_str)
        pump_max_head = parse_num(max_head_str)

        # Infeasibility checks
        # If the pump's physical limits are less than the required operating point, it cannot run
        if pump_max_head < target_head or pump_max_flow < target_flow:
            continue

        # Feasibility check: pump motor power should be capable of providing required BHP
        # We allow a small tolerance of 15% (some motors can run slightly overloaded or efficiency is higher)
        if pump_hp < (required_bhp * 0.85):
            continue

        # Calculate sweet-spot suitability score
        # Centrifugal pumps operate most efficiently around 55% - 75% of their max head and flow limits.
        # Too close to max head = low flow/shutoff risk. Too close to max flow = runout risk (cavitation).
        ratio_flow = target_flow / pump_max_flow
        ratio_head = target_head / pump_max_head
        
        # Flow suitability (centered around 0.65)
        flow_score = 1.0 - abs(ratio_flow - 0.65) * 1.5
        flow_score = max(0.0, min(1.0, flow_score))
        
        # Head suitability (centered around 0.65)
        head_score = 1.0 - abs(ratio_head - 0.65) * 1.5
        head_score = max(0.0, min(1.0, head_score))
        
        # Weighted average score (Head matching is slightly more critical for pump safety)
        suitability_score = (flow_score * 0.4 + head_score * 0.6) * 100
        
        # Safety factor adjustment: if motor power is excessively oversized, penalize slightly for energy waste
        oversize_ratio = pump_hp / max(0.1, required_bhp)
        if oversize_ratio > 2.5:
            suitability_score -= (oversize_ratio - 2.5) * 10
            suitability_score = max(30.0, suitability_score)

        # Electrical calculations
        power_kw = pump_hp * 0.746  # 1 HP = 0.746 kW
        daily_kwh = power_kw * daily_hours
        monthly_kwh = daily_kwh * 30
        estimated_monthly_cost = monthly_kwh * electricity_rate

        recommendations.append({
            "product": prod,
            "suitabilityScore": round(suitability_score, 1),
            "estimatedBHP": round(required_bhp, 2),
            "pumpHP": pump_hp,
            "waterHP": round(water_hp, 2),
            "flowRatioPct": round(ratio_flow * 100, 1),
            "headRatioPct": round(ratio_head * 100, 1),
            "powerConsumptionKW": round(power_kw, 2),
            "monthlyCostINR": round(estimated_monthly_cost, 2)
        })

    # Sort recommendations by suitability score descending
    recommendations.sort(key=lambda x: x['suitabilityScore'], reverse=True)

    return jsonify({
        "requiredWaterHP": round(water_hp, 3),
        "requiredBHP": round(required_bhp, 2),
        "recommendations": recommendations[:5]  # Return top 5 matches
    })

@app.route('/classify', methods=['POST'])
def classify_message():
    """
    Classifies customer messages by topic and urgency using keyword parsing.
    Expected request body:
    {
       "message": string,
       "name": string
    }
    """
    data = request.get_json() or {}
    message = str(data.get('message') or '').lower()
    name = str(data.get('name') or '')

    # Simple keywords list
    urgent_keywords = ["urgent", "broken", "stop", "leak", "failure", "burst", "emergency", "not working", "burn", "smoke", "blast", "flood", "dry-run", "tripped"]
    support_keywords = ["repair", "maintenance", "install", "help", "technical", "fault", "noise", "vibration", "warranty", "spare", "parts", "service"]
    sales_keywords = ["price", "cost", "quote", "buy", "purchase", "catalog", "dealer", "discount", "order", "inquiry"]

    # Detect urgency
    urgency = "Low"
    matches_urgent = [word for word in urgent_keywords if word in message]
    if len(matches_urgent) > 0:
        urgency = "High"
    elif len(message.split()) > 40:
        urgency = "Medium"

    # Detect category
    category = "General Inquiry"
    sales_count = sum(1 for word in sales_keywords if word in message)
    support_count = sum(1 for word in support_keywords if word in message)
    urgent_count = len(matches_urgent)

    if urgent_count > 0:
        category = "Technical Emergency"
    elif support_count > sales_count:
        category = "Technical Service Request"
    elif sales_count > 0:
        category = "Sales Inquiry"
        
    # Detect topics
    topics = []
    if any(w in message for w in ["agricultural", "crop", "farm", "borewell", "well", "submersible"]):
        topics.append("Agriculture / Submersibles")
    if any(w in message for w in ["pressure", "booster", "shower", "multistage"]):
        topics.append("Pressure Systems")
    if any(w in message for w in ["chemical", "slurry", "corrosion", "acid"]):
        topics.append("Industrial Process Pumps")
    if any(w in message for w in ["residential", "house", "villa", "tank"]):
        topics.append("Domestic Applications")

    return jsonify({
        "status": "classified",
        "name": name,
        "category": category,
        "urgency": urgency,
        "detectedTopics": topics,
        "flaggedWords": matches_urgent
    })

if __name__ == '__main__':
    try:
        print(f"\n==================================================")
        print(f"  Python Calculation Backend running on Port 8000")
        print(f"==================================================\n")
        app.run(port=8000, debug=False)
    except Exception as e:
        if "10048" in str(e) or "already in use" in str(e).lower():
            print(f"\n[FATAL ERROR] Port 8000 is already in use!")
            print(f"Please close any application running on port 8000 and restart.\n")
        else:
            print(f"\n[FATAL ERROR] Failed to start server: {e}\n")
