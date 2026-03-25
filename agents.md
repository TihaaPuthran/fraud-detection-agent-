# 🤖 agents.md

## AI Multi-Agent Financial Fraud Detection System (LangChain + Vibe UI)

---

## 🧠 Overview

This system is a **LangChain-powered Multi-Agent AI architecture** designed to:

* Detect fraudulent financial transactions
* Analyze anomalies using ML
* Generate explainable insights using LLM (Groq)
* Display results through a **dynamic, animated fintech dashboard UI**

---

## ⚙️ Global System Goal

> Build an intelligent, explainable, and visually engaging fraud detection system using multi-agent collaboration and modern UI/UX principles.

---

## 🧱 Tech Stack Context

* **Backend:** FastAPI (Render)
* **Agents Framework:** LangChain
* **LLM:** Groq API
* **Data Processing:** Pandas
* **ML Model:** Isolation Forest (Scikit-learn)
* **Frontend:** React + Tailwind CSS + Framer Motion (Vercel)

---

## 🔄 Workflow (LangChain Orchestration)

1. User submits transaction via UI
2. FastAPI endpoint triggers LangChain pipeline
3. Agents execute sequentially via chain
4. LLM (Groq) used for reasoning
5. Response returned to frontend with UI metadata
6. UI renders animated results

---

## 🧩 Agents Definition (LangChain Style)

---

### 📊 Data Analyzer Agent

**Type:** Tool / Chain Step
**Role:** Preprocess and structure transaction data

**Responsibilities:**

* Validate input
* Feature extraction
* Normalize values

**Input:** Raw JSON
**Output:** Clean structured data

**Tools:**

* Pandas

---

### 🚨 Anomaly Detection Agent

**Type:** ML Tool Integration

**Role:** Detect anomalies using trained model

**Responsibilities:**

* Apply Isolation Forest
* Generate anomaly score

**Output:**

* anomaly_score
* risk_level

---

### 🧠 Reasoning Agent (LLM Chain)

**Type:** LangChain LLMChain

**Role:** Generate explanation using Groq

**Prompt Template:**

> Explain why this transaction is suspicious based on anomaly score and transaction data.

**Output:**

* Explanation text

---

### 📢 Alert Agent

**Type:** Logic + Formatting Chain

**Role:** Generate alert message

**Responsibilities:**

* Map risk level → alert severity
* Format warning

---

### 📝 Report Generator Agent

**Type:** Final Chain

**Role:** Combine all outputs

**Output:**

* Final structured JSON response

---

## 🔗 LangChain Flow Design

* Use **SequentialChain** or **RouterChain**
* Each agent = chain/tool
* Memory (optional) → ConversationBufferMemory

---

## 📥 Input Schema

```json
{
  "user_id": "string",
  "amount": "number",
  "location": "string",
  "time": "string",
  "avg_spending": "number"
}
```

---

## 📤 Output Schema (UI-Aware)

```json
{
  "risk_level": "HIGH",
  "anomaly_score": 0.91,
  "explanation": "Transaction deviates significantly from user behavior",
  "alert": "⚠️ High risk transaction detected",
  "recommendation": "Block transaction",
  "ui_meta": {
    "color": "red",
    "animation": "pulse",
    "severity": "high"
  }
}
```

---

# 🎨 UI / UX SPECIFICATIONS (IMPORTANT 🔥)

## 🌙 Theme: Dark Fintech Dashboard

### 🎯 Design Style:

* Glassmorphism
* Neon highlights
* Smooth transitions
* Minimal + premium look

---

## 🎨 Color Palette (BEST COMBO)

### 🔹 Primary Colors:

* Background: `#0B0F19` (deep dark blue)
* Card: `#111827` (dark gray-blue)

### 🔹 Accent Colors:

* Neon Blue: `#3B82F6`
* Purple: `#8B5CF6`
* Cyan Glow: `#22D3EE`

### 🔹 Risk Colors:

* LOW → `#22C55E` (green)
* MEDIUM → `#FACC15` (yellow)
* HIGH → `#EF4444` (red)

---

## 🎬 Animation System (Framer Motion)

### 🔄 Loading Animation:

* Typing effect:

  * “Analyzing…”
  * “Detecting anomalies…”
  * “Generating insights…”

---

### ⚡ Button Animation:

* Scale down on click
* Glow effect on hover

---

### 📊 Result Card Animation:

* Slide-up transition
* Fade-in opacity
* Pulse glow for HIGH risk

---

### 🧠 AI Thinking Effect:

* Sequential text reveal
* Delay-based transitions

---

## 🧩 UI Components

### 1. Transaction Form

* Input fields
* Animated button

### 2. Processing Panel

* Live status updates

### 3. Result Card

* Risk badge (color-coded)
* Explanation text
* Recommendation

### 4. Analytics (Optional)

* Line chart (spending trend)
* Pie chart (fraud vs safe)

---

## 💡 UI Behavior Rules

* HIGH risk → red glow + pulse animation

* MEDIUM → yellow highlight

* LOW → green subtle fade

* Always show **step-by-step AI processing**

---

## 🚀 Deployment Integration

* Frontend deployed on Vercel
* Backend deployed on Render
* API communication via REST

---

## 🧠 Design Principles

* Explainable AI
* Visual feedback for every step
* Smooth UX (no sudden jumps)
* Modular agent architecture

---
