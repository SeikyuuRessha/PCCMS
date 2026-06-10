package com.astral.express.pccms.billing.service;

import com.astral.express.pccms.billing.dto.request.RecordPaymentRequest;
import com.astral.express.pccms.billing.dto.request.OwnerPaymentRequest;
import com.astral.express.pccms.billing.entity.PaymentStatus;
import com.astral.express.pccms.billing.dto.response.PaymentResponse;

import java.util.UUID;

public interface PaymentService {
    PaymentResponse recordPayment(RecordPaymentRequest request);

    PaymentResponse createOwnerPaymentRequest(UUID invoiceId, OwnerPaymentRequest request);

    PaymentResponse updatePaymentStatus(UUID paymentId, PaymentStatus statusCode, String note);
}
