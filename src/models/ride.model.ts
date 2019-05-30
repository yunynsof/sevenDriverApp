export interface Ride {
    id: string;
    passengerId: string;
    passengerName: string;
    driverId: string;
    driverName: string;
    vehicleId: string;
    vehicleName: string;
    vehicleRegister: string;
    startLatitude: string;
    startLongitude: string;
    startAddress: string;
    endLatitude: string;
    endLongitude: string;
    endAddress: string;
    baggage: string;
    status: number;
    fee: string;
    cancelationReason: string;
    numberOfPassengers: number;
    requestedAt: string;
    updatedAt: string;
}

