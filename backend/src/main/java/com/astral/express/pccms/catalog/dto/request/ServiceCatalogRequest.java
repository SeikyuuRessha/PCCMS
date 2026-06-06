package com.astral.express.pccms.catalog.dto.request;

import com.astral.express.pccms.catalog.entity.ServiceCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ServiceCatalogRequest(
        @NotBlank
        @Size(max = 60)
        String serviceCode,

        @NotBlank
        @Size(max = 160)
        String name,

        @NotNull
        ServiceCategory categoryCode,

        String description,

        @NotNull
        @Min(0)
        BigDecimal basePriceVnd,

        Integer durationMinutes,

        Boolean isActive,

        LocalDate effectiveFrom,

        LocalDate effectiveTo
) {
}
