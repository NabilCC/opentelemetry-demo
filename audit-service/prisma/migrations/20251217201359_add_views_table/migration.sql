-- CreateTable
CREATE TABLE "views" (
    "movie_id" INTEGER NOT NULL,
    "view_count" INTEGER NOT NULL,

    CONSTRAINT "views_pkey" PRIMARY KEY ("movie_id")
);
--
--
INSERT INTO views (movie_id, view_count) VALUES
(1,  0),
(2,  0),
(3,  0),
(4,  0),
(5,  0),
(6,  0),
(7,  0),
(8,  0),
(9,  0),
(10, 0)
;
