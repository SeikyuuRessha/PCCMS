package com.astral.express.pccms.reception.service;

import com.astral.express.pccms.reception.dto.request.AppointmentCancelRequest;
import com.astral.express.pccms.reception.dto.request.AppointmentReceiveRequest;
import com.astral.express.pccms.reception.dto.request.QuickAppointmentRequest;
import com.astral.express.pccms.reception.dto.response.AppointmentReceptionResponse;

import java.util.List;
import java.util.UUID;

public interface AppointmentReceptionService {
    List<AppointmentReceptionResponse> listAppointments(String keyword, String status);
    AppointmentReceptionResponse quickCreateAndReceive(QuickAppointmentRequest request);
    AppointmentReceptionResponse receive(UUID appointmentId, AppointmentReceiveRequest request);
    AppointmentReceptionResponse cancel(UUID appointmentId, AppointmentCancelRequest request);
}
