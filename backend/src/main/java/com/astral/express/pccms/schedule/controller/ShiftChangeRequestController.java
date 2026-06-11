package com.astral.express.pccms.schedule.controller;

import com.astral.express.pccms.common.dto.ApiResponse;
import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.schedule.dto.request.ShiftChangeRequestCreateRequest;
import com.astral.express.pccms.schedule.dto.response.ShiftChangeRequestResponse;
import com.astral.express.pccms.schedule.entity.ShiftRequestStatus;
import com.astral.express.pccms.schedule.service.ShiftChangeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/v1/me/shift-change-requests")
@RequiredArgsConstructor
public class ShiftChangeRequestController {
    private final ShiftChangeRequestService shiftChangeRequestService;

    @GetMapping
    public ApiResponse<PageResponse<ShiftChangeRequestResponse>> getMyRequests(
            @RequestParam(required = false) ShiftRequestStatus statusCode,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(shiftChangeRequestService.getMyRequests(statusCode, pageable));
    }

    @PostMapping
    public ApiResponse<ShiftChangeRequestResponse> createRequest(
            @Valid @RequestBody ShiftChangeRequestCreateRequest request) {
        return ApiResponse.success(shiftChangeRequestService.createRequest(request));
    }

    @PatchMapping("/{requestId}/cancel")
    public ApiResponse<ShiftChangeRequestResponse> cancelOwnRequest(@PathVariable UUID requestId) {
        return ApiResponse.success(shiftChangeRequestService.cancelOwnRequest(requestId));
    }

}
