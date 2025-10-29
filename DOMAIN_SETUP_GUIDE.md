# 🌐 Domain Setup Guide: brokmang.com

Your Vercel deployment is ready! Now you need to configure DNS at your domain registrar.

---

## 📋 **Current Status**

✅ Vercel shows "Valid Configuration" for both domains:
- `brokmang.com` (redirects to www)
- `www.brokmang.com` (production)

❌ DNS records not yet configured at your domain registrar

---

## 🎯 **Step 1: Get DNS Records from Vercel**

### In Vercel Dashboard:

1. On the **Domains** page (where you are now)
2. Click **"Edit"** next to `www.brokmang.com`
3. Vercel will show you the DNS records to add:
   - Usually a **CNAME** record pointing to Vercel
   - Or **A** records with specific IP addresses

**What to look for:**
- **Type**: CNAME or A record
- **Name**: `www` (or `@` for root domain)
- **Value/Points to**: Something like `cname.vercel-dns.com` or IP addresses

---

## 🔧 **Step 2: Configure DNS at Your Domain Registrar**

### Option A: If Vercel Shows CNAME Records

**For www subdomain:**
1. Go to your domain registrar (where you bought `brokmang.com`)
   - Examples: GoDaddy, Namecheap, Cloudflare, Google Domains
2. Navigate to **DNS Management** or **DNS Settings**
3. Add a new record:
   - **Type**: `CNAME`
   - **Name/Host**: `www`
   - **Value/Target**: (copy from Vercel, something like `cname.vercel-dns.com`)
   - **TTL**: `3600` (or leave default)

**For root domain (brokmang.com):**
- Vercel will show **A** records (IP addresses) or a redirect
- Follow Vercel's instructions exactly

### Option B: If Vercel Shows A Records

1. Add **A** records:
   - **Type**: `A`
   - **Name/Host**: `@` or leave blank (for root domain)
   - **Value/Points to**: IP address provided by Vercel
   - **TTL**: `3600`

---

## ⏱️ **Step 3: Wait for DNS Propagation**

After adding DNS records:
- ⏰ **Propagation time**: 5 minutes to 48 hours (usually 1-2 hours)
- 🧪 **Test**: Try accessing `www.brokmang.com` periodically

### Check DNS Propagation:
Use online tools to verify:
- [whatsmydns.net](https://www.whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)

Enter `www.brokmang.com` and check if it shows Vercel's IP address.

---

## 🚀 **Step 4: Test Your Site**

Once DNS propagates:
1. Visit `https://www.brokmang.com`
2. Your site should load! 🎉

---

## 🔍 **Troubleshooting**

### ❌ Still Getting DNS Error After 24 Hours?

1. **Double-check DNS records:**
   - Ensure record type matches Vercel's instructions
   - Ensure hostname is correct (`www` or `@`)
   - Ensure value points to Vercel

2. **Check with DNS tools:**
   - Use [whatsmydns.net](https://www.whatsmydns.net) to verify records

3. **Clear DNS cache:**
   ```bash
   # On Mac/Linux:
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # On Windows:
   ipconfig /flushdns
   ```

### ❌ SSL Certificate Issues?

- Vercel automatically provisions SSL certificates (Let's Encrypt)
- Usually takes 5-10 minutes after DNS is configured
- If it takes longer, check Vercel dashboard → Domains → SSL status

---

## 🎯 **Alternative: Test on Vercel Domain (Immediate)**

While waiting for DNS:

1. In Vercel dashboard, go to **Deployments**
2. Find your latest successful deployment
3. Click on it to see the **"Visit"** button
4. Your site is live at: `https://brokmang-[hash].vercel.app`

**You can use this URL to:**
- ✅ Test your application immediately
- ✅ Share with team members
- ✅ Verify everything works before DNS propagates

---

## 📝 **Common Domain Registrars**

### **GoDaddy:**
1. My Products → DNS → Manage DNS
2. Add record → Select type → Enter values

### **Namecheap:**
1. Domain List → Manage → Advanced DNS
2. Add New Record → Select type → Enter values

### **Cloudflare:**
1. Select domain → DNS → Records
2. Add record → Select type → Enter values

### **Google Domains:**
1. My Domains → DNS → Custom records
2. Add record → Select type → Enter values

---

## ✅ **Quick Checklist**

- [ ] Got DNS records from Vercel (click "Edit" on domain)
- [ ] Added CNAME/A records at domain registrar
- [ ] Waited 5-60 minutes for propagation
- [ ] Tested `www.brokmang.com` in browser
- [ ] Verified SSL certificate is active (should show 🔒 in browser)
- [ ] Tested site functionality

---

## 🆘 **Need Help?**

1. Check Vercel's domain documentation: https://vercel.com/docs/concepts/projects/domains
2. Check your domain registrar's DNS documentation
3. Verify DNS propagation status with online tools

---

**Once DNS propagates, your site will be live at `https://www.brokmang.com`! 🎉**

