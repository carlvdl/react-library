import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// import ReviewRequestModel from "../models/ReviewRequestModel";
// import {SpinnerLoading} from "../layouts/Utils/SpinnerLoading";

import ReviewModel from '../../models/ReviewModel';
import { Pagination } from '../../layouts/Utils/Pagination';
import { Review } from '../../layouts/Utils/Review';
import { SpinnerLoading } from '../../layouts/Utils/SpinnerLoading';

export const ReviewListPage = () => {
    const { bookId } = useParams<{ bookId: string }>();

    const [reviews, setReviews] = useState<ReviewModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;
    const [totalReviews, setTotalReviews] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const url = `http://localhost:8080/api/reviews/search/findByBookId?bookId=${bookId}&page=${currentPage - 1}&size=${reviewsPerPage}`;
                const res = await fetch(url);

                if (!res.ok) throw new Error('Failed to fetch reviews');

                const data = await res.json();
                const reviewsData = data._embedded?.reviews || [];

                const loadedReviews = reviewsData.map((r: any) => ({
                    id: r.id,
                    userEmail: r.userEmail,
                    date: r.date,
                    rating: r.rating,
                    book_id: r.book_id,
                    reviewDescription: r.reviewDescription,
                }));

                setReviews(loadedReviews);
                setTotalReviews(data.page.totalElements);
                setTotalPages(data.page.totalPages);
            } catch (error: any) {
                setHttpError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (bookId) {
            fetchReviews();
        }
    }, [bookId, currentPage]);

    if (isLoading) return <SpinnerLoading />;
    if (httpError) return <div className="container m-5"><p>{httpError}</p></div>;

    const indexOfFirst = (currentPage - 1) * reviewsPerPage + 1;
    const indexOfLast = Math.min(currentPage * reviewsPerPage, totalReviews);

    const handlePaginate = (page: number) => setCurrentPage(page);

    return (
        <div className="container mt-5">
            <h3>Comments: ({reviews.length})</h3>
            <p>{indexOfFirst} to {indexOfLast} of {totalReviews} items:</p>

            <div className="row">
                {reviews.map((review) => (
                    <Review review={review} key={review.id} />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={handlePaginate}
                />
            )}
        </div>
    );
};
