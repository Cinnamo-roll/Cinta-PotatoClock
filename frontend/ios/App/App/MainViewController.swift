import Capacitor
import UIKit

class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(TimerActivityPlugin())
        bridge?.registerPluginInstance(SafeAreaPlugin())
    }
}
