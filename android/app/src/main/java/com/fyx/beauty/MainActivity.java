package com.fyx.beauty;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth; // Import the GoogleAuth plugin
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    registerPlugin(GoogleAuth.class);
  }
}
