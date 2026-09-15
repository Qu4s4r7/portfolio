---
id: "lame"
title: "Lame"
platform: "HackTheBox"
os: "Linux"
difficulty: "Easy"
ip: "10.10.10.3"
date: "2026-08-10"
tags: ["samba", "metasploit", "suid"]
---

## Executive Summary
Lame es una máquina Linux fácil. Explota una vulnerabilidad en el servicio Samba 3.0.20 (*username map script*).

## Reconocimiento & Nmap
```bash
sudo nmap -sCV -p- --min-rate 5000 10.10.10.3