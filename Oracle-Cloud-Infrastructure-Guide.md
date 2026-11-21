# 🏰 Oracle Cloud Infrastructure & Architecture Master Guide
**Platform:** Heavenly Events Production & Occasion Desk CRM  
**Server Host:** `ubuntu@144.24.139.226`  
**Datacenter Region:** Oracle Cloud `ap-hyderabad-1` (AD-1)  
**Cost:** ₹0.00 / Month (Always Free Guarantee)  
**Repository:** [github.com/ashwinsaji2588/heavenly-events-platform](https://github.com/ashwinsaji2588/heavenly-events-platform)

---

## 1. Executive Architecture Overview

```
                      GLOBAL INTERNET (Wedding Clients in Kerala)
                                       │
                                       ▼
                     [ Oracle VCN Security List (Gate Guard) ]
                               Port 80, 443, 22
                                       │
                                       ▼
                   [ Public Subnet with Internet Gateway ]
                            Public IP: 144.24.139.226
                                       │
                                       ▼
                      [ Ubuntu Server (The Apartment) ]
                     ├── Inner Firewall (iptables Priority #1)
                     ├── Caddy (Reverse Proxy / Port 80)
                     └── Docker Network (Isolated Bridge)
                          ├── Container 1: Next.js App (:3000)
                          └── Container 2: PostgreSQL (:5432)
```

### The Real-World Mental Model
| Cloud Concept | Real-World Analogy | Purpose |
| :--- | :--- | :--- |
| **VCN (Virtual Cloud Network)** | A Secure Gated Community | Isolates your servers from all other Oracle customers in the world. |
| **Subnet (Public)** | A Paved Street with Main Road Access | Connects to an **Internet Gateway** so your server can have a public IPv4 address. |
| **Security List (Ingress)** | The Community Security Guard | Filters incoming traffic. Only allows ports 80 (HTTP), 443 (HTTPS), and 22 (SSH). |
| **Ubuntu `iptables`** | The Front Door Alarm & Lock | The server's internal Linux firewall. Rejects unlisted traffic. |
| **Compute Instance (VM)** | The Physical Apartment | The virtual machine running Ubuntu Linux 22.04 LTS. |
| **Shape (`VM.Standard.E2.1.Micro`)** | Apartment Size & Specs | 1 OCPU AMD CPU, 1 GB RAM, 0.48 Gbps network bandwidth. Always free. |
| **Boot Volume (46.6 GB SSD)** | Storage Closets & Cabinets | The NVMe SSD disk holding the operating system, Docker images, and database data. |
| **Swap Space (3 GB)** | Overflow Storage Room | Borrows SSD space to act as extra RAM so compilers never crash from out-of-memory. |
| **Caddy Reverse Proxy** | Building Concierge | Receives all web traffic on Port 80 and passes it internally to Next.js on Port 3000. |
| **SSH Private Key (`.key`)** | Master Physical Key | The cryptographic key on your laptop allowing passwordless administrative access. |

---

## 2. Your Compute Instance Details

* **Instance Name:** `webapp-prod`
* **Status:** `Running` (Green badge)
* **Operating System:** Canonical Ubuntu 22.04 Minimal (`aarch64` / `x86_64`)
* **Public IPv4 Address:** `144.24.139.226`
* **Default Admin Username:** `ubuntu`
* **Fault Domain:** `FD-1`
* **Availability Domain:** `AD-1`

### Explaining Oracle Console Buttons
* **"Start" Button:** Only active when the server is powered off. When the instance is already in the `Running` state, clicking it does nothing.
* **`Actions` → `Reboot`:** Performs a soft restart of Ubuntu. Use this if the server ever freezes or becomes unresponsive.
* **`Actions` → `Stop`:** Shuts down the operating system. (Useful if you want to make configuration changes while halted).
* **`Actions` → `Terminate`:** ⚠️ **CRITICAL DANGER** — This deletes your virtual machine and wipes its hard drive permanently. **Never click Terminate.**

---

## 3. Networking: VCN, Subnets & The Two Firewalls

### A. Virtual Cloud Network (`webapp-vcn`)
Your VCN has a regional CIDR block (`10.0.0.0/16`). It provides private IP addresses (`10.0.0.x`) to servers inside it so they can communicate securely without exposing ports to the public internet.

### B. Public Subnet vs Private Subnet
* **Public Subnet (`public subnet-webapp-vcn`)**: Attached to an **Internet Gateway (IGW)** with default route `0.0.0.0/0 -> Internet Gateway`. Servers inside are assigned public IPs reachable by anyone on Earth.
* **Private Subnet**: Has no route to the Internet Gateway. Used only for confidential backend services or banking databases.

### C. The Two-Firewall Architecture
One of the most common pitfalls in Oracle Cloud is having two independent firewalls:

1. **Outer Firewall (Oracle Security List Ingress Rules):**
   * Configured in the Oracle Cloud Web Console.
   * `Source: 0.0.0.0/0`, `Protocol: TCP`, `Destination Port: 80,443` (Web traffic).
   * `Source: 0.0.0.0/0`, `Protocol: TCP`, `Destination Port: 22` (SSH remote access).
2. **Inner Firewall (Ubuntu `iptables` inside the VM):**
   * Ubuntu images from Oracle have a default rule at line #5 that **rejects all traffic with `icmp-host-prohibited`**.
   * To allow web visitors to reach Caddy, an `ACCEPT` rule was injected at **priority #1** (before the reject rule) and saved with `netfilter-persistent`:
     ```bash
     sudo iptables -I INPUT 1 -p tcp -m multiport --dports 80,443,3000 -j ACCEPT
     sudo netfilter-persistent save
     ```

---

## 4. SSH Remote Access (Connecting from Windows)

**SSH (Secure Shell)** creates an encrypted tunnel between your Windows PowerShell and the Ubuntu terminal.

### The Key Pair Architecture
* **Public Key:** Located on the VM in `/home/ubuntu/.ssh/authorized_keys`.
* **Private Key:** Located on your Windows PC at `C:\Users\ashwi\.ssh\oracle_key`.

### Windows File Permissions (`icacls`)
OpenSSH rejects private keys stored in standard folders (like `Downloads`) if other users have read access. The key was locked down so only your Windows user can read it:
```powershell
icacls C:\Users\ashwi\.ssh\oracle_key /inheritance:r
icacls C:\Users\ashwi\.ssh\oracle_key /grant:r ${env:USERNAME}:R
```

### How to SSH into Your Server
Open PowerShell on your Windows PC and run:
```powershell
ssh -i C:\Users\ashwi\.ssh\oracle_key ubuntu@144.24.139.226
```

---

## 5. Memory Engineering: The 3 GB Swap File

* **The Problem:** The free VM shape has **1 GB of physical RAM**. Compiling Next.js with TypeScript and Tailwind (`next build`) uses 1.5 GB to 2 GB of RAM during production packaging. Without extra memory, the Linux kernel terminates the build with an **OOM (Out of Memory)** crash.
* **The Solution:** We allocated a persistent **3 GB Swap file** on the SSD:
  ```bash
  sudo fallocate -l 3G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
* **Result:** **1 GB Physical RAM + 3 GB Swap = 4 GB Total Memory Space**. Builds complete smoothly and never crash. Once built, running the app uses only ~85 MB of RAM.

---

## 6. Web Traffic Flow & Port Architecture

```
Client Phone
     │
     ▼ (Port 80 HTTP)
Oracle Public IP: 144.24.139.226
     │
     ▼
Ubuntu Caddy Reverse Proxy (:80)
     │
     ▼ (Internal Proxy)
Docker Host Port 3000 (localhost:3000)
     │
     ▼
heavenly-app Container (Next.js 15)
     │
     ▼ (Internal Docker Bridge)
heavenly-postgres Container (PostgreSQL 16 on postgres:5432)
```

---

## 7. Automated Deployments (Two Options)

### Option 1: Automatic Push-to-Deploy via GitHub Actions
Every time you push code to `origin/main`, GitHub Actions automatically connects via SSH to your Oracle VM, pulls the latest code, rebuilds the Docker container, pushes database updates, and verifies the live site.
* Workflow file: `.github/workflows/deploy.yml`
* GitHub Repository Secret Required: `ORACLE_SSH_KEY` (Contains your private key).

### Option 2: Local One-Command Deploy Script
Run this single command from your Windows PowerShell inside the project directory:
```powershell
powershell -File scripts\deploy.ps1 "Your commit message here"
```
It will automatically commit, push to GitHub, SSH into Oracle Cloud, and reload the live container!

---

## 8. Why This Stack Costs ₹0.00 / Month

| Resource | Oracle / GitHub Free Tier Allowance | Our Usage | Cost |
| :--- | :--- | :--- | :--- |
| **Compute VM** | Up to 2 Micro instances Always Free | 1 Instance | **₹0.00** |
| **Boot Volume** | 200 GB NVMe SSD Always Free | 46.6 GB | **₹0.00** |
| **Public IPv4** | 1 IPv4 Address Always Free | 1 Address (`144.24.139.226`) | **₹0.00** |
| **Bandwidth** | 10,000 GB (10 TB) / Month Free | < 2 GB / Month | **₹0.00** |
| **GitHub Actions** | Unlimited minutes for Public Repos | ~2 min per deploy | **₹0.00** |
| **Database** | PostgreSQL inside Docker volume | 0 Managed DB fees | **₹0.00** |

---

## 9. Quick Reference Links & Credentials

* **Public Website:** [http://144.24.139.226](http://144.24.139.226)
* **Occasion Desk CRM:** [http://144.24.139.226/desk](http://144.24.139.226/desk)
* **Partner Login:** [http://144.24.139.226/login](http://144.24.139.226/login)
  - **Admin Partner:** `jomit@heavenlyevents.in`
  - **Co-Partner:** `savio@heavenlyevents.in`
  - **Password:** `Heavenly@2026!`
* **Self-Service Agency Onboarding:** [http://144.24.139.226/onboard](http://144.24.139.226/onboard)
* **Local Dev (Windows):** [http://localhost:3001](http://localhost:3001) | [http://localhost:3001/desk](http://localhost:3001/desk)
