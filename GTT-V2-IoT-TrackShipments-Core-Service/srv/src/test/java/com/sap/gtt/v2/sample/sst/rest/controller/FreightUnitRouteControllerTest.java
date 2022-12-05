package com.sap.gtt.v2.sample.sst.rest.controller;

import static java.util.UUID.randomUUID;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.sap.gtt.v2.sample.sst.rest.service.FreightUnitRouteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FreightUnitRouteControllerTest {

    @Mock
    private FreightUnitRouteService freightUnitRouteService;
    @InjectMocks
    private FreightUnitRouteController freightUnitRouteController;

    @Test
    void getByFreightUnitId_givenFreightUnitId_shouldCallAllServices() {
        // given
        final String freightUnitId = randomUUID().toString();

        // when
        freightUnitRouteController.getByFreightUnitId(freightUnitId);

        // then
        verify(freightUnitRouteService, times(1)).getByTrackedProcessId(freightUnitId);
    }
}