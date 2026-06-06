package com.astral.express.pccms.catalog.controller;

import com.astral.express.pccms.catalog.dto.request.ServiceCatalogRequest;
import com.astral.express.pccms.catalog.dto.response.ServiceCatalogResponse;
import com.astral.express.pccms.catalog.entity.ServiceCategory;
import com.astral.express.pccms.catalog.service.ServiceCatalogService;
import com.astral.express.pccms.common.dto.ApiResponse;
import com.astral.express.pccms.common.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/admin/service-catalog")
@RequiredArgsConstructor
public class ServiceCatalogController {

    private final ServiceCatalogService serviceCatalogService;

    @GetMapping
    @PreAuthorize("hasAuthority('SERVICE_MANAGE')")
    public ApiResponse<PageResponse<ServiceCatalogResponse>> searchServices(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ServiceCategory categoryCode,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(serviceCatalogService.searchServices(keyword, categoryCode, isActive, pageable));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SERVICE_MANAGE')")
    public ApiResponse<ServiceCatalogResponse> createService(@Valid @RequestBody ServiceCatalogRequest request) {
        return ApiResponse.success(serviceCatalogService.createService(request));
    }

    @PutMapping("/{serviceId}")
    @PreAuthorize("hasAuthority('SERVICE_MANAGE')")
    public ApiResponse<ServiceCatalogResponse> updateService(
            @PathVariable UUID serviceId,
            @Valid @RequestBody ServiceCatalogRequest request) {
        return ApiResponse.success(serviceCatalogService.updateService(serviceId, request));
    }

    @DeleteMapping("/{serviceId}")
    @PreAuthorize("hasAuthority('SERVICE_MANAGE')")
    public ApiResponse<ServiceCatalogResponse> deactivateService(@PathVariable UUID serviceId) {
        return ApiResponse.success(serviceCatalogService.deactivateService(serviceId));
    }

    @PatchMapping("/{serviceId}/deactivate")
    @PreAuthorize("hasAuthority('SERVICE_MANAGE')")
    public ApiResponse<ServiceCatalogResponse> deactivateServiceWithActionPath(@PathVariable UUID serviceId) {
        return ApiResponse.success(serviceCatalogService.deactivateService(serviceId));
    }
}
