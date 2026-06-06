package com.astral.express.pccms.schedule.service;

import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.schedule.dto.request.ShiftChangeRequestCreateRequest;
import com.astral.express.pccms.schedule.dto.response.ShiftChangeRequestResponse;
import com.astral.express.pccms.schedule.entity.ShiftRequestStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ShiftChangeRequestService {
    PageResponse<ShiftChangeRequestResponse> getMyRequests(ShiftRequestStatus statusCode, Pageable pageable);

    ShiftChangeRequestResponse createRequest(ShiftChangeRequestCreateRequest request);

    ShiftChangeRequestResponse cancelOwnRequest(UUID requestId);

    ShiftChangeRequestResponse updateRequestStatus(UUID requestId, ShiftRequestStatus statusCode);
}
