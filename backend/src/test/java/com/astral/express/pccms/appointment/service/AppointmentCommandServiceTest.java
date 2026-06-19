package com.astral.express.pccms.appointment.service;

import com.astral.express.pccms.appointment.dto.request.CreateMedicalAppointmentRequest;
import com.astral.express.pccms.appointment.dto.request.QuickCheckInRequest;
import com.astral.express.pccms.appointment.dto.response.AppointmentResponse;
import com.astral.express.pccms.appointment.entity.Appointment;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AppointmentCommandServiceTest {

    @Mock
    private CreateMedicalAppointmentUseCase createMedicalAppointmentUseCase;
    @Mock
    private QuickCheckInUseCase quickCheckInUseCase;
    @Mock
    private AppointmentResponseAssembler responseAssembler;
    @InjectMocks
    private AppointmentCommandService commandService;

    @Test
    void commandBoundaryMustKeepPersistenceAndResponseMappingInOneTransaction() {
        assertThat(AppointmentCommandService.class).hasAnnotation(Transactional.class);
    }

    @Test
    void createMedicalAppointmentMapsResponseBeforeLeavingCommandBoundary() {
        CreateMedicalAppointmentRequest request = mock(CreateMedicalAppointmentRequest.class);
        UUID ownerId = UUID.randomUUID();
        Appointment appointment = new Appointment();
        AppointmentResponse expected = mock(AppointmentResponse.class);
        given(createMedicalAppointmentUseCase.createMedicalAppointment(request, ownerId)).willReturn(appointment);
        given(responseAssembler.toResponse(appointment, null)).willReturn(expected);

        AppointmentResponse result = commandService.createMedicalAppointment(request, ownerId);

        assertThat(result).isSameAs(expected);
        verify(responseAssembler).toResponse(appointment, null);
    }

    @Test
    void quickCheckInMapsResponseBeforeLeavingCommandBoundary() {
        QuickCheckInRequest request = mock(QuickCheckInRequest.class);
        UUID staffId = UUID.randomUUID();
        Appointment appointment = new Appointment();
        AppointmentResponse expected = mock(AppointmentResponse.class);
        given(quickCheckInUseCase.execute(request, staffId))
                .willReturn(new QuickCheckInUseCase.Result(appointment, 7));
        given(responseAssembler.toResponse(appointment, 7)).willReturn(expected);

        AppointmentResponse result = commandService.quickCheckIn(request, staffId);

        assertThat(result).isSameAs(expected);
        verify(responseAssembler).toResponse(appointment, 7);
    }
}
