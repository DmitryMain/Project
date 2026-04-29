package org.example.gadgetmarket.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class ModerationTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private Listing listing;

    @Column(nullable = false)
    private boolean forbiddenContent;

    @Column(nullable = false)
    private boolean imageQualityOk;

    @Column(nullable = false)
    private boolean categoryMatch;

    @Column(nullable = false)
    private boolean blocked;
}
