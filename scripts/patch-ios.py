#!/usr/bin/env python3
"""Run after `npx cap add ios`: adds the Associated Domains entitlement (universal links for /c/)."""
import re
ent = 'ios/App/App/App.entitlements'
open(ent, 'w').write('''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>com.apple.developer.associated-domains</key>
  <array><string>applinks:smartdns.mahehub.com</string></array>
</dict></plist>
''')
p = 'ios/App/App.xcodeproj/project.pbxproj'
s = open(p).read()
if 'CODE_SIGN_ENTITLEMENTS' not in s:
    s = re.sub(r'(PRODUCT_BUNDLE_IDENTIFIER = com\.mahehub\.app;)', r'CODE_SIGN_ENTITLEMENTS = App/App.entitlements;\n\t\t\t\t\1', s)
    open(p, 'w').write(s)
print('ios entitlements patched')
