import FuelTracker from "@/components/FuelTracker";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Fuel Tracker - Real-time Fuel Consumption Calculator</title>
        <meta name="description" content="Track your fuel consumption in real-time using GPS. Calculate how much fuel you've spent based on distance traveled from the gas station." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#141a24" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Helmet>
      <FuelTracker />
    </>
  );
};

export default Index;
