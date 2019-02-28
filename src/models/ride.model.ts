export interface Ride {
    id: string;
    passengerId: string;
    passengerName: string;
    driverId: string;
    driverName: string;
    vehicleId: string;
    startLatitude: string;
    startLongitude: string;
    endLatitude: string;
    endLongitude: string;
    baggage: string;
    status: string;
    fee: string;
    cancelationReason: string;
    numberOfPassengers: number;
    requestedAt: string;
    updatedAt: string;
}