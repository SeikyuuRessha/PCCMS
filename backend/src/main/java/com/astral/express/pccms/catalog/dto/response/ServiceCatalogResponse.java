package com.astral.express.pccms.catalog.dto.response;

import com.astral.express.pccms.catalog.entity.ServiceCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ServiceCatalogResponse(
        UUID id,
        String serviceCode,
        String name,
        ServiceCategory categoryCode,
        String description,
        BigDecimal basePriceVnd,
        Integer durationMinutes,
        Boolean isActive,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
