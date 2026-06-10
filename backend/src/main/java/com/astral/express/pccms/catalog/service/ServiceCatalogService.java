package com.astral.express.pccms.catalog.service;

import com.astral.express.pccms.catalog.dto.request.ServiceCatalogRequest;
import com.astral.express.pccms.catalog.dto.response.ServiceCatalogResponse;
import com.astral.express.pccms.appointment.entity.ServiceCategory;
import com.astral.express.pccms.common.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ServiceCatalogService {
    PageResponse<ServiceCatalogResponse> searchServices(
            String keyword,
            ServiceCategory categoryCode,
            Boolean isActive,
            Pageable pageable);

    ServiceCatalogResponse createService(ServiceCatalogRequest request);

    ServiceCatalogResponse updateService(UUID serviceId, ServiceCatalogRequest request);

    ServiceCatalogResponse deactivateService(UUID serviceId);
}

