#!/usr/bin/env python3
"""Run after `npx cap add android`: adds https://smartdns.mahehub.com/c/ app links to the manifest."""
import re, sys
p = 'android/app/src/main/AndroidManifest.xml'
s = open(p, encoding='utf-8').read()
if 'smartdns.mahehub.com' not in s:
    intent = '''
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="smartdns.mahehub.com" android:pathPrefix="/c" />
            </intent-filter>
'''
    s = re.sub(r'(</activity>)', intent + r'        \1', s, count=1)
    open(p, 'w', encoding='utf-8').write(s)
print('android manifest patched')
