# skillpath


import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */

const COURSE_API = "https://syncsphere-hiv6.onrender.com/assignment/course-data"

const COUNTRY_API =
    "https://syncsphere-hiv6.onrender.com/assignment/country-code"

type Course = {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    shortCourse: string
    courseType: string
    pricePaise: number
    priceUsdCents: number
    mangoId: string
    refundable: boolean
}

type Props = {
    cardBackground: string
    cardRadius: number
}

export default function CourseGrid(props: Props) {
    const { cardBackground, cardRadius } = props

    const [courses, setCourses] = React.useState<Course[]>([])
    const [country, setCountry] = React.useState<"IN" | "US" | null>(null)

    const [coursesLoading, setCoursesLoading] = React.useState(true)
    const [countryLoading, setCountryLoading] = React.useState(true)

    const [coursesError, setCoursesError] = React.useState(false)
    const [countryError, setCountryError] = React.useState(false)

    React.useEffect(() => {
        let cancelled = false

        async function loadCourses() {
            try {
                setCoursesLoading(true)
                setCoursesError(false)

                const response = await fetch(COURSE_API, {
                    method: "GET",
                })

                if (!response.ok) {
                    throw new Error(`Course API returned ${response.status}`)
                }

                const data = await response.json()

                if (!Array.isArray(data)) {
                    throw new Error("Invalid course data")
                }

                if (!cancelled) {
                    setCourses(data)
                }
            } catch (error) {
                console.error("Course request failed:", error)

                if (!cancelled) {
                    setCoursesError(true)
                    setCourses([])
                }
            } finally {
                if (!cancelled) {
                    setCoursesLoading(false)
                }
            }
        }

        async function loadCountry() {
            try {
                setCountryLoading(true)
                setCountryError(false)

                const response = await fetch(COUNTRY_API, {
                    method: "GET",
                })

                if (!response.ok) {
                    throw new Error(`Country API returned ${response.status}`)
                }

                const data = await response.json()

                if (data.country_code !== "IN" && data.country_code !== "US") {
                    throw new Error("Invalid country code")
                }

                if (!cancelled) {
                    setCountry(data.country_code)
                }
            } catch (error) {
                console.error("Country request failed:", error)

                if (!cancelled) {
                    setCountryError(true)
                    setCountry(null)
                }
            } finally {
                if (!cancelled) {
                    setCountryLoading(false)
                }
            }
        }

        loadCourses()
        loadCountry()

        return () => {
            cancelled = true
        }
    }, [])

    //  1. LOADING STATE

    if (coursesLoading || countryLoading) {
        return (
            <div style={styles.stateContainer}>
                <div style={styles.loadingText}>Loading courses…</div>
            </div>
        )
    }

    // 2. COURSE API ERROR

    if (coursesError) {
        return (
            <div style={styles.stateContainer}>
                <div style={styles.stateIcon}>!</div>

                <h2 style={styles.stateTitle}>Unable to load courses</h2>

                <p style={styles.stateDescription}>
                    Something went wrong while loading the courses. Please try
                    again.
                </p>
            </div>
        )
    }

    // ZERO RESULTS

    if (courses.length === 0) {
        return (
            <div style={styles.stateContainer}>
                <div style={styles.stateIcon}>○</div>

                <h2 style={styles.stateTitle}>No courses available</h2>

                <p style={styles.stateDescription}>
                    There are currently no courses to display.
                </p>
            </div>
        )
    }

    // 4. COUNTRY API FAILED

    const priceUnavailable = countryError || country === null

    return (
        <div style={styles.wrapper}>
            <style>
                {`
                    .course-grid {
                        display: grid;
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                        gap: 20px;
                        width: 100%;
                    }

                    @media (max-width: 900px) {
                        .course-grid {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }
                    }

                    @media (max-width: 600px) {
                        .course-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                `}
            </style>

            {priceUnavailable && (
                <div style={styles.notice}>
                    Prices are temporarily unavailable because the currency
                    could not be determined.
                </div>
            )}

            <div className="course-grid">
                {courses.map((course) => {
                    let formattedPrice = ""

                    if (!priceUnavailable) {
                        if (country === "IN") {
                            const rupees = course.pricePaise / 100

                            formattedPrice = new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                            }).format(rupees)
                        }

                        if (country === "US") {
                            const dollars = course.priceUsdCents / 100

                            formattedPrice = new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }).format(dollars)
                        }
                    }

                    return (
                        <article
                            key={course.courseCode}
                            style={{
                                ...styles.card,
                                background: cardBackground,
                                borderRadius: cardRadius,
                            }}
                        >
                            <div style={styles.category}>
                                {course.mainCategory}
                            </div>

                            <h2 style={styles.courseName}>
                                {course.courseName}
                            </h2>

                            <p style={styles.description}>
                                {course.description}
                            </p>

                            <div style={styles.footer}>
                                {priceUnavailable ? (
                                    <span style={styles.priceUnavailable}>
                                        Price unavailable
                                    </span>
                                ) : (
                                    <span style={styles.price}>
                                        {formattedPrice}
                                    </span>
                                )}

                                <span style={styles.courseType}>
                                    {course.courseType}
                                </span>
                            </div>

                            {course.refundable && (
                                <div style={styles.refundable}>Refundable</div>
                            )}
                        </article>
                    )
                })}
            </div>
        </div>
    )
}

CourseGrid.defaultProps = {
    cardBackground: "#FFFFFF",
    cardRadius: 16,
}

addPropertyControls(CourseGrid, {
    cardBackground: {
        type: ControlType.Color,
        title: "Card Background",
        defaultValue: "#FFFFFF",
    },

    cardRadius: {
        type: ControlType.Number,
        title: "Card Radius",
        defaultValue: 16,
        min: 0,
        max: 40,
        step: 1,
        unit: "px",
    },
})

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        width: "100%",
        boxSizing: "border-box",
        padding: 24,
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    card: {
        minWidth: 0,
        boxSizing: "border-box",
        padding: 24,
        border: "1px solid #E5E7EB",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        display: "flex",
        flexDirection: "column",
    },

    category: {
        alignSelf: "flex-start",
        padding: "6px 10px",
        borderRadius: 999,
        background: "#F3F4F6",
        color: "#374151",
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 16,
    },

    courseName: {
        margin: 0,
        fontSize: 22,
        lineHeight: 1.2,
        fontWeight: 700,
        color: "#111827",
    },

    description: {
        margin: "12px 0 0",
        fontSize: 14,
        lineHeight: 1.5,
        color: "#6B7280",

        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },

    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginTop: 24,
    },

    price: {
        fontSize: 20,
        fontWeight: 700,
        color: "#111827",
    },

    priceUnavailable: {
        fontSize: 14,
        fontWeight: 600,
        color: "#B45309",
    },

    courseType: {
        flexShrink: 0,
        fontSize: 12,
        fontWeight: 600,
        color: "#6B7280",
        background: "#F9FAFB",
        padding: "6px 8px",
        borderRadius: 8,
    },

    refundable: {
        marginTop: 12,
        fontSize: 12,
        color: "#047857",
        fontWeight: 600,
    },

    notice: {
        marginBottom: 16,
        padding: "10px 12px",
        borderRadius: 10,
        background: "#FFFBEB",
        color: "#92400E",
        fontSize: 13,
        lineHeight: 1.4,
    },

    stateContainer: {
        width: "100%",
        minHeight: 300,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 32,
        boxSizing: "border-box",
        fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    loadingText: {
        fontSize: 15,
        fontWeight: 600,
        color: "#6B7280",
    },

    stateIcon: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F3F4F6",
        color: "#374151",
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 12,
    },

    stateTitle: {
        margin: 0,
        fontSize: 18,
        color: "#111827",
    },

    stateDescription: {
        margin: "8px 0 0",
        fontSize: 14,
        lineHeight: 1.5,
        color: "#6B7280",
        maxWidth: 360,
    },
}
