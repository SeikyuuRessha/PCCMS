package com.astral.express.pccms.reception.service;

import com.astral.express.pccms.reception.dto.request.CareLogRequest;
import com.astral.express.pccms.reception.dto.response.BoardingBookingResponse;
import com.astral.express.pccms.reception.dto.response.CareLogMediaResponse;
import com.astral.express.pccms.reception.dto.response.CareLogResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface BoardingCareLogService {
    List<BoardingBookingResponse> listBookings(String keyword, String status);
    List<CareLogResponse> listCareLogs(UUID sessionId, UUID petId);
    CareLogResponse saveCareLog(CareLogRequest request);
    CareLogMediaResponse uploadMedia(UUID careLogId, MultipartFile file);
}
