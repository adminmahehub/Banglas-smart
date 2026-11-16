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

# --- Native helper plugin: save the WireGuard .conf (file picker) and send it straight to the WireGuard app ---
import os
pkg_dir = 'android/app/src/main/java/com/mahehub/app'
os.makedirs(pkg_dir, exist_ok=True)
open(pkg_dir + '/MaheNativePlugin.java', 'w', encoding='utf-8').write('''package com.mahehub.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import android.content.ContentValues;
import android.os.Build;
import android.provider.MediaStore;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "MaheNative")
public class MaheNativePlugin extends Plugin {

    // Saves straight into the phone's Downloads folder (no permission needed on Android 10+).
    @PluginMethod
    public void saveToDownloads(PluginCall call) {
        String name = call.getString("name", "mahehub.conf");
        String text = call.getString("text", "");
        if (text == null || text.isEmpty()) { call.reject("empty"); return; }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) { call.reject("old_android"); return; }
        try {
            ContentValues v = new ContentValues();
            v.put(MediaStore.Downloads.DISPLAY_NAME, name);
            v.put(MediaStore.Downloads.MIME_TYPE, "application/octet-stream");
            v.put(MediaStore.Downloads.RELATIVE_PATH, "Download");
            Uri uri = getContext().getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
            if (uri == null) { call.reject("write_failed"); return; }
            OutputStream os = getContext().getContentResolver().openOutputStream(uri, "wt");
            if (os == null) { call.reject("write_failed"); return; }
            os.write(text.getBytes(StandardCharsets.UTF_8));
            os.close();
            call.resolve();
        } catch (Exception e) {
            call.reject("write_failed");
        }
    }

    // Opens the Android "Save as" file picker (Storage Access Framework) and writes the text there.
    @PluginMethod
    public void saveFile(PluginCall call) {
        String name = call.getString("name", "mahehub.conf");
        String text = call.getString("text", "");
        if (text == null || text.isEmpty()) { call.reject("empty"); return; }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/octet-stream");
        intent.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(call, intent, "saveResult");
    }

    @ActivityCallback
    private void saveResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("cancelled");
            return;
        }
        try {
            Uri uri = result.getData().getData();
            OutputStream os = getContext().getContentResolver().openOutputStream(uri, "wt");
            if (os == null) { call.reject("write_failed"); return; }
            os.write(call.getString("text", "").getBytes(StandardCharsets.UTF_8));
            os.close();
            JSObject ret = new JSObject();
            ret.put("uri", uri.toString());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("write_failed");
        }
    }

    // Sends the .conf directly to the WireGuard app (no chooser list).
    @PluginMethod
    public void openInWireGuard(PluginCall call) {
        String name = call.getString("name", "mahehub.conf");
        String text = call.getString("text", "");
        if (text == null || text.isEmpty()) { call.reject("empty"); return; }
        try {
            File dir = new File(getContext().getCacheDir(), "wg");
            if (!dir.exists()) dir.mkdirs();
            File f = new File(dir, name);
            FileOutputStream fos = new FileOutputStream(f);
            fos.write(text.getBytes(StandardCharsets.UTF_8));
            fos.close();
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("application/octet-stream");
            intent.putExtra(Intent.EXTRA_STREAM, uri);
            intent.setPackage("com.wireguard.android");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (ActivityNotFoundException e) {
            call.reject("not_installed");
        } catch (Exception e) {
            call.reject("failed");
        }
    }
}
''')
ma = pkg_dir + '/MainActivity.java'
open(ma, 'w', encoding='utf-8').write('''package com.mahehub.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MaheNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
''')
print('native helper plugin added')
