package com.techStack.authSys.tour.controllers;

import com.techStack.authSys.auth.security.CustomUserDetails;
import com.techStack.authSys.tour.dto.response.WishlistItemResponse;
import com.techStack.authSys.tour.services.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/me/wishlist")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WishlistController {

    private final WishlistService wishlistService;

    /**
     * GET /api/me/wishlist
     *
     * Returns the authenticated user's saved tours.
     */
    @GetMapping
    public Flux<WishlistItemResponse> getWishlist(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return wishlistService.getWishlist(
                user.getUserId()
        );
    }

    /**
     * POST /api/me/wishlist/{tourId}
     *
     * Adds a tour to the authenticated user's wishlist.
     *
     * The operation is idempotent. Saving an already-saved tour returns
     * the existing wishlist item.
     */
    @PostMapping("/{tourId}")
    public Mono<ResponseEntity<WishlistItemResponse>> addToWishlist(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable UUID tourId
    ) {
        return wishlistService
                .addToWishlist(user.getUserId(), tourId)
                .map(item -> ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(item)
                );
    }

    /**
     * DELETE /api/me/wishlist/{tourId}
     *
     * Removes a tour from the authenticated user's wishlist.
     */
    @DeleteMapping("/{tourId}")
    public Mono<ResponseEntity<Void>> removeFromWishlist(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable UUID tourId
    ) {
        return wishlistService
                .removeFromWishlist(user.getUserId(), tourId)
                .thenReturn(
                        ResponseEntity.noContent().build()
                );
    }
}