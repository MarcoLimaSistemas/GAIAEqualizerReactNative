package com.gaiaequalizerreactnative;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class BluetoothModule extends ReactContextBaseJavaModule {
    private static final String TAG = "BluetoothModule";
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket bluetoothSocket;
    private OutputStream outputStream;
    private InputStream inputStream;
    private boolean isConnected = false;
    private Context context;

    public BluetoothModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        this.bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    }

    @Override
    public String getName() {
        return "BluetoothModule";
    }

    @ReactMethod
    public void isEnabled(Promise promise) {
        try {
            boolean enabled = bluetoothAdapter != null && bluetoothAdapter.isEnabled();
            promise.resolve(enabled);
        } catch (Exception e) {
            promise.reject("BLUETOOTH_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void enable(Promise promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BLUETOOTH_ERROR", "Bluetooth not supported");
                return;
            }
            
            if (!bluetoothAdapter.isEnabled()) {
                Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                enableBtIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(enableBtIntent);
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("BLUETOOTH_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getPairedDevices(Promise promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BLUETOOTH_ERROR", "Bluetooth not supported");
                return;
            }

            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
            WritableArray devices = Arguments.createArray();

            for (BluetoothDevice device : pairedDevices) {
                WritableMap deviceMap = Arguments.createMap();
                deviceMap.putString("id", device.getAddress());
                deviceMap.putString("name", device.getName());
                deviceMap.putBoolean("paired", true);
                devices.pushMap(deviceMap);
            }

            promise.resolve(devices);
        } catch (Exception e) {
            promise.reject("BLUETOOTH_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void connect(String deviceId, Promise promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BLUETOOTH_ERROR", "Bluetooth not supported");
                return;
            }

            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceId);
            if (device == null) {
                promise.reject("BLUETOOTH_ERROR", "Device not found");
                return;
            }

            // Cancel any existing connection
            if (bluetoothSocket != null) {
                try {
                    bluetoothSocket.close();
                } catch (IOException e) {
                    Log.e(TAG, "Error closing existing socket", e);
                }
            }

            bluetoothSocket = device.createRfcommSocketToServiceRecord(SPP_UUID);
            bluetoothSocket.connect();
            
            outputStream = bluetoothSocket.getOutputStream();
            inputStream = bluetoothSocket.getInputStream();
            isConnected = true;

            // Start listening for incoming data
            startListening();

            WritableMap result = Arguments.createMap();
            result.putString("id", deviceId);
            result.putString("name", device.getName());
            promise.resolve(result);
        } catch (Exception e) {
            isConnected = false;
            promise.reject("BLUETOOTH_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void disconnect(Promise promise) {
        try {
            isConnected = false;
            
            if (outputStream != null) {
                outputStream.close();
                outputStream = null;
            }
            
            if (inputStream != null) {
                inputStream.close();
                inputStream = null;
            }
            
            if (bluetoothSocket != null) {
                bluetoothSocket.close();
                bluetoothSocket = null;
            }

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("BLUETOOTH_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void write(String data, Promise promise) {
        try {
            if (!isConnected || outputStream == null) {
                promise.reject("BLUETOOTH_ERROR", "Not connected");
                return;
            }

            outputStream.write(data.getBytes());
            outputStream.flush();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("BLUETOOTH_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void isConnected(Promise promise) {
        promise.resolve(isConnected);
    }

    private void startListening() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                byte[] buffer = new byte[1024];
                int bytes;

                while (isConnected) {
                    try {
                        bytes = inputStream.read(buffer);
                        if (bytes > 0) {
                            String data = new String(buffer, 0, bytes);
                            sendEvent("onDataReceived", data);
                        }
                    } catch (IOException e) {
                        if (isConnected) {
                            Log.e(TAG, "Error reading from input stream", e);
                            sendEvent("onConnectionError", e.getMessage());
                        }
                        break;
                    }
                }
            }
        }).start();
    }

    private void sendEvent(String eventName, String data) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, data);
    }
}
