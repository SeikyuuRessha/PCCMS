package com.astral.express.pccms.schedule.controller;

import com.astral.express.pccms.common.dto.ApiResponse;
import com.astral.express.pccms.schedule.dto.request.ShiftRequestStatusUpdateRequest;
import com.astral.express.pccms.schedule.dto.response.ShiftChangeRequestResponse;
import com.astral.express.pccms.schedule.service.ShiftChangeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/admin/shift-change-requests")
@RequiredArgsConstructor
public class AdminShiftChangeRequestController {
    private final ShiftChangeRequestService shiftChangeRequestService;

    @PatchMapping("/{requestId}/status")
    public ApiResponse<ShiftChangeRequestResponse> updateRequestStatus(
            @PathVariable UUID requestId,
            @Valid @RequestBody ShiftRequestStatusUpdateRequest request) {
        return ApiResponse.success(shiftChangeRequestService.updateRequestStatus(requestId, request.statusCode()));
    }
}
