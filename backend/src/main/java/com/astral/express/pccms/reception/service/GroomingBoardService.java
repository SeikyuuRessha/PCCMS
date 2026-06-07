package com.astral.express.pccms.reception.service;

import com.astral.express.pccms.reception.dto.request.GroomingStatusUpdateRequest;
import com.astral.express.pccms.reception.dto.response.GroomingTicketResponse;

import java.util.List;
import java.util.UUID;

public interface GroomingBoardService {
    List<GroomingTicketResponse> listTickets(String keyword, String status);
    GroomingTicketResponse updateStatus(UUID ticketId, GroomingStatusUpdateRequest request);
}
