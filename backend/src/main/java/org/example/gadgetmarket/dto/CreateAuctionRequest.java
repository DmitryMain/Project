package org.example.gadgetmarket.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateAuctionRequest(
        @NotNull Long listingId,
        @NotNull BigDecimal startPrice,
        @NotNull BigDecimal minStep,
        @NotNull Integer durationMinutes
) {
}
