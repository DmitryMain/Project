package org.example.gadgetmarket.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ListingPhoto> photos = new ArrayList<>();

    @Column(nullable = false)
    private boolean approved = false;

    @ManyToOne(optional = false)
    private AppUser seller;

    @ManyToOne(optional = false)
    @jakarta.validation.constraints.NotNull
    private AppUser createdBy;

    public String getFirstPhotoPath() {
        if (photos != null && !photos.isEmpty()) {
            return photos.stream()
                    .min((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                    .map(ListingPhoto::getPhotoPath)
                    .orElse(null);
        }
        return null;
    }
}
