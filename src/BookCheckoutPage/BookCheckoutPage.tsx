import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

// import BookModel from "../../models/BookModel";

import BookModel from "../models/BookModel";
import ReviewModel from "../models/ReviewModel";
import ReviewRequestModel from "../models/ReviewRequestModel";
import {SpinnerLoading} from "../layouts/Utils/SpinnerLoading";

// import { SpinnerLoading } from "../Utils/SpinnerLoading";
import { StarsReview } from "../layouts/Utils/StarsReview";
import { CheckoutAndReviewBox } from "./CheckoutAndReviewBox";
import { LatestReviews } from "./LatestReviews";

export const BookCheckoutPage = () => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    const { bookId } = useParams<{ bookId: string }>();

    const [book, setBook] = useState<BookModel>();
    const [reviews, setReviews] = useState<ReviewModel[]>([]);
    const [totalStars, setTotalStars] = useState(0);

    const [isReviewLeft, setIsReviewLeft] = useState(false);
    const [isCheckedOut, setIsCheckedOut] = useState(false);
    const [currentLoansCount, setCurrentLoansCount] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/books/${bookId}`);
                if (!response.ok) throw new Error("Failed to fetch book");
                const data = await response.json();

                const loadedBook: BookModel = {
                    id: data.id,
                    title: data.title,
                    author: data.author,
                    description: data.description,
                    copies: data.copies,
                    copiesAvailable: data.copiesAvailable,
                    category: data.category,
                    img: data.img,
                };

                setBook(loadedBook);
            } catch (error: any) {
                setHttpError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (bookId) fetchBook();
    }, [bookId]);

    useEffect(() => {
        const fetchBookReviews = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/reviews/search/findByBookId?bookId=${bookId}`
                );
                if (!response.ok) throw new Error("Failed to fetch reviews");
                const data = await response.json();

                const reviewsData = data._embedded?.reviews ?? [];
                const loadedReviews: ReviewModel[] = [];
                let total = 0;

                for (const r of reviewsData) {
                    loadedReviews.push({
                        id: r.id,
                        userEmail: r.userEmail,
                        date: r.date,
                        rating: r.rating,
                        book_id: r.bookId,
                        reviewDescription: r.reviewDescription,
                    });
                    total += r.rating;
                }

                if (loadedReviews.length > 0) {
                    const average = (Math.round((total / loadedReviews.length) * 2) / 2).toFixed(1);
                    setTotalStars(Number(average));
                }

                setReviews(loadedReviews);
            } catch (error: any) {
                setHttpError(error.message);
            }
        };

        if (bookId) fetchBookReviews();
    }, [isReviewLeft, bookId]);

    useEffect(() => {
        const fetchUserReview = async () => {
            try {
                if (isAuthenticated) {
                    const token = await getAccessTokenSilently();
                    const response = await fetch(
                        `http://localhost:8080/api/reviews/secure/user/book?bookId=${bookId}`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    if (!response.ok) throw new Error("Failed to fetch user review");
                    const data = await response.json();
                    setIsReviewLeft(data);
                }
            } catch (error: any) {
                setHttpError(error.message);
            }
        };

        if (bookId) fetchUserReview();
    }, [bookId, isAuthenticated, getAccessTokenSilently]);

    useEffect(() => {
        const fetchLoansCount = async () => {
            try {
                if (isAuthenticated) {
                    const token = await getAccessTokenSilently();
                    const response = await fetch(
                        `http://localhost:8080/api/books/secure/currentloans/count`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    if (!response.ok) throw new Error("Failed to fetch current loans count");
                    const data = await response.json();
                    setCurrentLoansCount(data);
                }
            } catch (error: any) {
                setHttpError(error.message);
            }
        };

        fetchLoansCount();
    }, [isAuthenticated, getAccessTokenSilently, isCheckedOut]);

    useEffect(() => {
        const fetchCheckedOutStatus = async () => {
            try {
                if (isAuthenticated) {
                    const token = await getAccessTokenSilently();
                    const response = await fetch(
                        `http://localhost:8080/api/books/secure/ischeckedout/byuser?bookId=${bookId}`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    if (!response.ok) throw new Error("Failed to fetch checkout status");
                    const data = await response.json();
                    setIsCheckedOut(data);
                }
            } catch (error: any) {
                setHttpError(error.message);
            }
        };

        if (bookId) fetchCheckedOutStatus();
    }, [bookId, isAuthenticated, getAccessTokenSilently]);

    const checkoutBook = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `http://localhost:8080/api/books/secure/checkout?bookId=${book?.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) throw new Error("Failed to checkout book");
            setIsCheckedOut(true);
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    const submitReview = async (star: number, desc: string) => {
        try {
            const token = await getAccessTokenSilently();
            const requestModel = new ReviewRequestModel(star, book?.id ?? 0, desc);

            const response = await fetch(`http://localhost:8080/api/reviews/secure`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestModel),
            });

            if (!response.ok) throw new Error("Failed to submit review");

            setIsReviewLeft(true);
        } catch (error: any) {
            setHttpError(error.message);
        }
    };

    if (!bookId) return <div className="container mt-5"><p>Invalid Book ID</p></div>;
    if (isLoading) return <SpinnerLoading />;
    if (httpError) return <div className="container mt-5"><p>{httpError}</p></div>;

    //                                src={require("./../..//BooksImages/book-luv2code-1000.png")}
    return (
        <div>
            {/* Desktop View */}
            <div className="container d-none d-lg-block">
                <div className="row mt-5">
                    <div className="col-sm-2">
                        {book?.img ? (
                            <img src={book.img} width="226" height="349" alt="Book" />
                        ) : (
                            <img
                                src={require("./../Images/BooksImages/book-luv2code-1000.png")}
                                width="226"
                                height="349"
                                alt="Default Book"
                            />
                        )}
                    </div>
                    <div className="col-md-4">
                        <h2>{book?.title}</h2>
                        <h5 className="text-primary">{book?.author}</h5>
                        <p className="lead">{book?.description}</p>
                        <StarsReview rating={totalStars} size={32} />
                    </div>
                    <CheckoutAndReviewBox
                        book={book}
                        mobile={false}
                        currentLoansCount={currentLoansCount}
                        isAuthenticated={isAuthenticated}
                        isCheckedOut={isCheckedOut}
                        checkoutBook={checkoutBook}
                        isReviewLeft={isReviewLeft}
                        submitReview={submitReview}
                    />
                </div>
                <hr />
                <LatestReviews reviews={reviews} bookId={book?.id} mobile={false} />
            </div>

            {/* Mobile View */}
            <div className="container d-lg-none mt-5">
                <div className="d-flex justify-content-center">
                    {book?.img ? (
                        <img src={book.img} width="226" height="349" alt="Book" />
                    ) : (
                        <img
                            src={require("./../Images/BooksImages/book-luv2code-1000.png")}
                            width="226"
                            height="349"
                            alt="Default Book"
                        />
                    )}
                </div>
                <div className="mt-4">
                    <h2>{book?.title}</h2>
                    <h5 className="text-primary">{book?.author}</h5>
                    <p className="lead">{book?.description}</p>
                    <StarsReview rating={totalStars} size={32} />
                </div>
                <CheckoutAndReviewBox
                    book={book}
                    mobile={true}
                    currentLoansCount={currentLoansCount}
                    isAuthenticated={isAuthenticated}
                    isCheckedOut={isCheckedOut}
                    checkoutBook={checkoutBook}
                    isReviewLeft={isReviewLeft}
                    submitReview={submitReview}
                />
                <hr />
                <LatestReviews reviews={reviews} bookId={book?.id} mobile={true} />
            </div>
        </div>
    );
};
