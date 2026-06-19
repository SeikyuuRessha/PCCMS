package com.astral.express.pccms.appointment.service;

import com.astral.express.pccms.appointment.dto.request.CreateMedicalAppointmentRequest;
import com.astral.express.pccms.appointment.dto.request.QuickCheckInRequest;
import com.astral.express.pccms.appointment.dto.response.AppointmentResponse;
import com.astral.express.pccms.appointment.entity.Appointment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentCommandService {
    private final CreateMedicalAppointmentUseCase createMedicalAppointmentUseCase;
    private final QuickCheckInUseCase quickCheckInUseCase;
    private final AppointmentResponseAssembler responseAssembler;

    public AppointmentResponse createMedicalAppointment(CreateMedicalAppointmentRequest request, UUID ownerId) {
        Appointment appointment = createMedicalAppointmentUseCase.createMedicalAppointment(request, ownerId);
        return responseAssembler.toResponse(appointment, null);
    }

    public AppointmentResponse quickCheckIn(QuickCheckInRequest request, UUID staffId) {
        QuickCheckInUseCase.Result result = quickCheckInUseCase.execute(request, staffId);
        return responseAssembler.toResponse(result.appointment(), result.queueNumber());
    }
}
