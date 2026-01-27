# 🛡️ RiskRadar  
**Simple security visibility for small businesses**

---

## 📖 Project Description

RiskRadar is a free, lightweight web application designed to give small businesses and startups clear visibility into potential security risks affecting their websites.

Modern cyber-attacks no longer focus only on large organisations. Automated attacks regularly target small websites because they are less likely to have dedicated security teams or expensive monitoring tools.

RiskRadar continuously monitors website traffic and checks visitor IP addresses against trusted public threat intelligence services. If a visitor is associated with known malicious behaviour, RiskRadar highlights this in a simple dashboard.

Instead of showing technical logs or complex data, RiskRadar explains everything in plain English, allowing non-technical users to quickly understand:

- What is happening  
- Why it might be a concern  
- Whether action may be needed  

No security expertise is required.

RiskRadar acts as an early-warning system, helping users spot problems before they turn into serious incidents such as hacked accounts, website defacement, or service disruption.

---

## ❗ The Problem

Small businesses are increasingly targeted by:

- Brute-force login attempts  
- Credential-stuffing attacks using leaked passwords  
- Automated bots scanning for weaknesses  
- Traffic from known malicious IP addresses  

These attacks often occur silently and repeatedly.

Large organisations use expensive security platforms to detect this activity.  
Small businesses rarely have access to these tools.

As a result:

- Attacks go unnoticed  
- Accounts are compromised  
- Customer trust is damaged  
- Recovery is costly and time-consuming  

Most businesses only discover a problem after damage has already occurred.

---

## 💡 Why RiskRadar Exists

RiskRadar exists to provide simple, affordable security awareness.

Rather than overwhelming users with technical detail, RiskRadar focuses on three questions:

- Is anything suspicious happening?  
- Where is it coming from?  
- How serious does it appear?

By presenting only the most important security signals, RiskRadar allows users to make informed decisions without needing technical knowledge.

---

## 🎯 What RiskRadar Does

RiskRadar:

- Collects website traffic data  
- Extracts visitor IP addresses  
- Checks IPs against multiple public blacklist and reputation APIs  
- Stores and analyses results  
- Displays findings in a visual dashboard  

Users can:

- View a list of risky IP addresses  
- See unusual traffic spikes  
- View severity levels (Low, Medium, High)  
- Read plain-language explanations  
- Receive simple guidance  

Example alert:

> This IP address has been reported for brute-force login attempts.  
> If this IP appears frequently, consider blocking it or enabling stronger login protection.

---

## 👤 Who RiskRadar Is For

- Small business owners  
- Startup founders  
- Marketing teams  
- Solo developers  
- Non-technical staff  

If you manage a website and want basic security awareness without complexity, RiskRadar is for you.

---

## ⭐ Our Promise

- Free and easy to use  
- No security knowledge required  
- Clear explanations  
- Actionable insights  
- Transparent about limitations  

RiskRadar does not replace professional security services.  
It provides visibility so issues are spotted earlier.

---

## ▶️ Installation & Usage

The following steps work on **Windows, macOS, and Linux**.

### Requirements

- Node.js (version 18 or later)  
- npm (comes with Node.js)  
- Git  

---

### Installation

1. Open Terminal (macOS) or Command Prompt / PowerShell (Windows)

2. Clone the repository:

git clone https://github.com/harleendhillon25/ProjectBeta

3. Move into the project folder:


4. Install dependencies:


5. Create an environment file:

6. Open `.env` and add your API keys.

---

### Running the Application

1. Start backend server:

2. Start frontend:

3. Open browser:

http://localhost:3000

You will see the RiskRadar dashboard.

---

## 🛠️ Technologies

- JavaScript  
- Node.js  
- PostgreSQL
- Supabase  
- Visual studio code 

---

## 🔁 Process

1. Researched common threats affecting small businesses.  
2. Selected reliable public threat intelligence APIs.  
3. Designed simple user flows.  
4. Built backend services for data collection.  
5. Implemented caching and scheduled updates.  
6. Built frontend dashboard.  
7. Added severity scoring.  
8. Wrote plain-language explanations.  
9. Tested with sample traffic.

---

## 📸 Screenshots

### Lower Wireframes 

### Higher Wireframes 

---

## 🏆 Wins & Challenges

### Wins

- Successfully integrated external APIs  
- Built working dashboard  
- Created simple explanations  
- Designed non-technical interface  

### Challenges

- Managing API limits  
- Reducing false positives  
- Keeping explanations accurate but simple  

---

## 🐞 Bugs

- Occasional delayed API responses  
- No automated blocking  

---

## 🚀 Future Features

- Email alerts  
- Geo-location map  
- Historical trends  
- Custom thresholds  
- Exportable reports  
- Optional authentication  

---

## 🔐 Security & Privacy

- No personal data collected  
- IP addresses stored only for analysis  
- HTTPS enforced  
- No password storage  

---