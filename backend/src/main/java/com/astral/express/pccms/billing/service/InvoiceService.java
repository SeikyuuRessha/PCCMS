package com.astral.express.pccms.billing.service;

import com.astral.express.pccms.billing.dto.response.InvoiceResponse;
import com.astral.express.pccms.common.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface InvoiceService {
    PageResponse<InvoiceResponse> listMyInvoices(Pageable pageable);

    PageResponse<InvoiceResponse> listInvoices(Pageable pageable);

    InvoiceResponse getInvoice(UUID invoiceId);
}
