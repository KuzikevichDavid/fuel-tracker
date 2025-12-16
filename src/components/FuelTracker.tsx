import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Fuel, MapPin, Play, Square, RotateCcw, Navigation } from "lucide-react";
import { toast } from "sonner";

interface Position {
  latitude: number;
  longitude: number;
}

const FuelTracker = () => {
  const [consumptionRate, setConsumptionRate] = useState<string>("8.5");
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [fuelSpent, setFuelSpent] = useState(0);
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "acquiring" | "active" | "error">("idle");
  
  const watchIdRef = useRef<number | null>(null);

  // Haversine formula to calculate distance between two GPS coordinates
  const calculateDistance = useCallback((pos1: Position, pos2: Position): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pos2.latitude - pos1.latitude) * (Math.PI / 180);
    const dLon = (pos2.longitude - pos1.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pos1.latitude * (Math.PI / 180)) *
        Math.cos(pos2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Calculate fuel spent based on distance and consumption rate
  useEffect(() => {
    const rate = parseFloat(consumptionRate) || 0;
    const spent = (rate * distance) / 100;
    setFuelSpent(spent);
  }, [distance, consumptionRate]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your device");
      return;
    }

    const rate = parseFloat(consumptionRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Please enter a valid consumption rate");
      return;
    }

    setGpsStatus("acquiring");
    setDistance(0);
    setFuelSpent(0);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const start: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setStartPosition(start);
        setCurrentPosition(start);
        setIsTracking(true);
        setGpsStatus("active");
        toast.success("Tracking started from gas station!");

        // Start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const current: Position = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            setCurrentPosition(current);
            
            if (start) {
              const dist = calculateDistance(start, current);
              setDistance(dist);
            }
          },
          (error) => {
            console.error("GPS error:", error);
            setGpsStatus("error");
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
          }
        );
      },
      (error) => {
        console.error("GPS error:", error);
        setGpsStatus("error");
        toast.error("Could not get your location. Please enable GPS.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  }, [consumptionRate, calculateDistance]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setGpsStatus("idle");
    toast.info("Tracking stopped");
  }, []);

  const resetTracking = useCallback(() => {
    stopTracking();
    setDistance(0);
    setFuelSpent(0);
    setStartPosition(null);
    setCurrentPosition(null);
  }, [stopTracking]);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col p-4 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <header className="text-center py-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Fuel className="w-8 h-8 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">
            FUEL TRACKER
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">Track your fuel consumption in real-time</p>
      </header>

      {/* Consumption Rate Input */}
      <div className="dashboard-card p-5 mb-4">
        <label className="block text-muted-foreground text-sm mb-2 font-medium">
          Consumption Rate (L/100km)
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={consumptionRate}
            onChange={(e) => setConsumptionRate(e.target.value)}
            disabled={isTracking}
            className="w-full h-14 bg-muted border border-border rounded-lg px-4 text-foreground font-display text-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="8.5"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            L/100km
          </span>
        </div>
      </div>

      {/* Main Display */}
      <div className="dashboard-card p-6 mb-4 flex-1 flex flex-col justify-center">
        {/* Fuel Spent Display */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Fuel className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              Fuel Spent
            </span>
          </div>
          <div className="digit-display text-6xl font-bold text-primary">
            {fuelSpent.toFixed(2)}
          </div>
          <span className="text-muted-foreground text-lg">liters</span>
        </div>

        {/* Distance Display */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-success" />
            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              Distance Traveled
            </span>
          </div>
          <div className="digit-display text-4xl font-semibold text-success">
            {distance.toFixed(2)}
          </div>
          <span className="text-muted-foreground">km</span>
        </div>

        {/* GPS Status */}
        <div className="flex items-center justify-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              gpsStatus === "active"
                ? "bg-success animate-pulse"
                : gpsStatus === "acquiring"
                ? "bg-primary animate-pulse"
                : gpsStatus === "error"
                ? "bg-destructive"
                : "bg-muted-foreground"
            }`}
          />
          <span className="text-muted-foreground text-xs uppercase tracking-wider">
            {gpsStatus === "active"
              ? "GPS Active"
              : gpsStatus === "acquiring"
              ? "Acquiring GPS..."
              : gpsStatus === "error"
              ? "GPS Error"
              : "GPS Standby"}
          </span>
        </div>

        {/* Coordinates Display */}
        {currentPosition && (
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
              <MapPin className="w-3 h-3" />
              <span>
                {currentPosition.latitude.toFixed(5)}, {currentPosition.longitude.toFixed(5)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        {!isTracking ? (
          <Button
            variant="dashboard"
            size="xl"
            className="w-full"
            onClick={startTracking}
            disabled={gpsStatus === "acquiring"}
          >
            <Play className="w-6 h-6" />
            {gpsStatus === "acquiring" ? "ACQUIRING GPS..." : "START FROM GAS STATION"}
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="xl"
            className="w-full font-display tracking-wider"
            onClick={stopTracking}
          >
            <Square className="w-6 h-6" />
            STOP TRACKING
          </Button>
        )}

        {(distance > 0 || fuelSpent > 0) && !isTracking && (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={resetTracking}
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        )}
      </div>

      {/* Formula Info */}
      <div className="mt-6 text-center">
        <p className="text-muted-foreground text-xs">
          Formula: (L/100km) × (km traveled / 100) = Fuel spent
        </p>
      </div>
    </div>
  );
};

export default FuelTracker;
