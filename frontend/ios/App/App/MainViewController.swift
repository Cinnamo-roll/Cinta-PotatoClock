import Capacitor
import UIKit

class MainViewController: CAPBridgeViewController {
    private let potatoBackground = UIColor(red: 248.0 / 255.0, green: 243.0 / 255.0, blue: 231.0 / 255.0, alpha: 1.0)

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = potatoBackground
        webView?.isOpaque = false
        webView?.backgroundColor = .clear
        webView?.scrollView.backgroundColor = potatoBackground
    }

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(TimerActivityPlugin())
        bridge?.registerPluginInstance(SafeAreaPlugin())
    }
}
