import 'dart:developer' as developer;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

class LocationState {
  final Position? position;
  final bool isLoading;
  final String? error;

  const LocationState({this.position, this.isLoading = false, this.error});
}

class LocationNotifier extends StateNotifier<LocationState> {
  LocationNotifier() : super(const LocationState());

  Future<void> getCurrentLocation() async {
    developer.log('LocationNotifier.getCurrentLocation: starting', name: 'LocationProvider');
    state = const LocationState(isLoading: true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        developer.log('LocationNotifier: location services disabled', name: 'LocationProvider');
        state = const LocationState(error: 'Location services are disabled');
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          developer.log('LocationNotifier: permission denied', name: 'LocationProvider');
          state = const LocationState(error: 'Location permission denied');
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        developer.log('LocationNotifier: permission permanently denied', name: 'LocationProvider');
        state = const LocationState(
            error: 'Location permissions are permanently denied');
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
        ),
      );
      developer.log(
        'LocationNotifier: got position lat=${position.latitude} lng=${position.longitude}',
        name: 'LocationProvider',
      );
      state = LocationState(position: position);
    } catch (e) {
      developer.log('LocationNotifier: FAILED - $e', name: 'LocationProvider', level: 1000);
      state = LocationState(error: e.toString());
    }
  }
}

final locationProvider =
    StateNotifierProvider<LocationNotifier, LocationState>((ref) {
  return LocationNotifier();
});
