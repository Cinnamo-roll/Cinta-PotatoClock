package com.cinoo.clock;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TimerActivityPlugin.class);
        registerPlugin(SafeAreaPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
