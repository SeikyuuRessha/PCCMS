package com.astral.express.pccms.report.service;

import com.astral.express.pccms.appointment.entity.ServiceCategory;
import com.astral.express.pccms.report.dto.response.ReportSummaryResponse;
import com.astral.express.pccms.report.entity.ReportType;

import java.time.LocalDate;
import java.util.UUID;

public interface ReportSummaryService {

    ReportSummaryResponse getSummary(
            LocalDate fromDate,
            LocalDate toDate,
            ReportType reportType,
            ServiceCategory categoryCode,
            UUID serviceId);
}

