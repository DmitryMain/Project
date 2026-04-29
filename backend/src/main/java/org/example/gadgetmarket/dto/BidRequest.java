package org.example.gadgetmarket.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BidRequest(
        @NotNull Long bidderId,
        @NotNull BigDecimal amount,
        BigDecimal autoBidLimit
) {
}
