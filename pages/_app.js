import '@/styles/globals.css'
import '../styles/Animations/LoginPageLeftAnims.css'
import '../styles/FA/all.css'
// import '../styles/FA/App.css'
import '../styles/FA/sharp-light.css'
import '../styles/FA/sharp-regular.css'
import '../styles/FA/sharp-solid.css'
import '../styles/FA/sharp-thin.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
