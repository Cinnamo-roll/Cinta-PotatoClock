/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import Capacitor
import UIKit

@objc(SafeAreaPlugin)
public class SafeAreaPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SafeAreaPlugin"
    public let jsName = "SafeArea"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getInsets", returnType: CAPPluginReturnPromise)
    ]

    @objc func getInsets(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let insets = self.bridge?.viewController?.view.safeAreaInsets ?? .zero
            call.resolve([
                "top": Double(insets.top),
                "bottom": Double(insets.bottom)
            ])
        }
    }
}
