import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Alerts() {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getAuthHeaders = () => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwt") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("authToken") ||
            localStorage.getItem("accessToken");

        return token ? { Authorization: `Bearer ${token}` } : null;
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        const headers = getAuthHeaders();
        if (!headers) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:8081/api/members', { headers });
            const memberData = res.data.content ? res.data.content : res.data;
            setMembers(Array.isArray(memberData) ? memberData : []);
        } catch (err) {
            console.error("Error fetching members for alerts:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const isDateInDays = (dateValue, offsetDays) => {
        if (!dateValue) return false;

        let targetMonth;
        let targetDay;

        if (typeof dateValue === 'string') {
            const parts = dateValue.split('T')[0].split('-');
            if (parts.length >= 3) {
                targetMonth = parseInt(parts[1], 10);
                targetDay = parseInt(parts[2], 10);
            }
        } else if (Array.isArray(dateValue) && dateValue.length >= 3) {
            targetMonth = parseInt(dateValue[1], 10);
            targetDay = parseInt(dateValue[2], 10);
        }

        if (!targetMonth || !targetDay) return false;

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + offsetDays);

        return (
            targetMonth === (targetDate.getMonth() + 1) &&
            targetDay === targetDate.getDate()
        );
    };

    const getFullName = (member) =>
        `${member.firstName || ''} ${member.lastName || ''}`.trim();

    const getLinkedPartner = (member) => {
        if (!member.spouseMemberId) return null;
        return members.find((m) => String(m.memberId) === String(member.spouseMemberId)) || null;
    };

    const getAnniversaryAlerts = (offsetDays) => {
        const seenCouples = new Set();

        return members
            .filter(
                (member) =>
                    member.maritalStatus === "Married" &&
                    member.anniversaryDate &&
                    isDateInDays(member.anniversaryDate, offsetDays) &&
                    member.spouseMemberId
            )
            .map((member) => {
                const partner = getLinkedPartner(member);
                const anniversaryKey = (member.anniversaryDate || '').split('T')[0];

                let coupleKey;
                if (partner) {
                    const pairIds = [String(member.memberId), String(partner.memberId)].sort();
                    coupleKey = `${anniversaryKey}|${pairIds.join('|')}`;
                } else {
                    const pairNames = [
                        getFullName(member).toLowerCase(),
                        (member.spouseName || '').toLowerCase()
                    ].sort();
                    coupleKey = `${anniversaryKey}|${pairNames.join('|')}`;
                }

                return {
                    ...member,
                    spouseName: partner ? getFullName(partner) : member.spouseName,
                    coupleKey
                };
            })
            .filter((member) => {
                if (seenCouples.has(member.coupleKey)) {
                    return false;
                }
                seenCouples.add(member.coupleKey);
                return true;
            });
    };

    const bdaysToday = members.filter((m) => isDateInDays(m.dateOfBirth || m.dob, 0));
    const bdaysTomorrow = members.filter((m) => isDateInDays(m.dateOfBirth || m.dob, 1));
    const bdaysDayAfter = members.filter((m) => isDateInDays(m.dateOfBirth || m.dob, 2));

    const annivToday = getAnniversaryAlerts(0);
    const annivTomorrow = getAnniversaryAlerts(1);
    const annivDayAfter = getAnniversaryAlerts(2);

    const containerStyle = {
        padding: "10px",
        fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    };

    const sectionTitleStyle = {
        fontSize: "20px",
        fontWeight: "700",
        color: "#1a202c",
        borderBottom: "2px solid #edf2f7",
        paddingBottom: "12px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
    };

    const cardStyle = {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        border: "1px solid #edf2f7",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        marginBottom: "16px",
        transition: "transform 0.2s ease"
    };

    const emptyStateStyle = {
        color: "#a0aec0",
        padding: "20px",
        background: "#f8fafc",
        borderRadius: "8px",
        border: "1px dashed #e2e8f0",
        fontSize: "15px",
        marginBottom: "30px"
    };

    const renderAlertCards = (list, tagColor, tagText, type) => {
        if (list.length === 0) {
            return <div style={emptyStateStyle}>No {type}s {tagText.toLowerCase()}.</div>;
        }

        const isAnniversary = type === "Anniversary";

        return list.map((member, index) => (
            <div
                key={member.coupleKey || member.memberId || index}
                style={cardStyle}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateX(5px)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "translateX(0)")}
            >
                <div style={{ fontSize: "32px" }}>{isAnniversary ? "💍" : "🎁"}</div>

                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 4px 0", color: "#2d3748", fontSize: "18px" }}>
                        {isAnniversary && member.spouseName
                            ? `${member.firstName} ${member.lastName || ''} & ${member.spouseName}`.trim()
                            : `${member.firstName} ${member.lastName || ''}`.trim()}
                    </h3>
                    <p style={{ margin: 0, color: "#718096", fontSize: "14px" }}>
                        📞 {member.contactNumber || "No phone"} • ✉️ {member.email || "No email"}
                    </p>
                </div>

                <span
                    style={{
                        background: tagColor.bg,
                        color: tagColor.text,
                        padding: "6px 14px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "700"
                    }}
                >
                    {tagText}
                </span>
            </div>
        ));
    };

    if (isLoading) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "#a0aec0", fontSize: "18px" }}>
                Loading alert data...
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div
                style={{
                    background: "#ebf4ff",
                    borderLeft: "4px solid #3182ce",
                    padding: "16px 20px",
                    borderRadius: "8px",
                    marginBottom: "40px"
                }}
            >
                <h2 style={{ margin: "0 0 8px 0", color: "#2b6cb0", fontSize: "18px" }}>
                    🔔 System Alerts
                </h2>
                <p
                    style={{
                        margin: "0 0 10px 0",
                        color: "#4a5568",
                        fontSize: "14px",
                        lineHeight: "1.5"
                    }}
                >
                    Stay updated with your congregation. Here are the upcoming birthdays and anniversaries for the next 3 days.
                </p>
            </div>

            <h2 style={sectionTitleStyle}>🎉 Birthdays</h2>
            {renderAlertCards(bdaysToday, { bg: "#fed7d7", text: "#c53030" }, "TODAY", "Birthday")}
            {renderAlertCards(bdaysTomorrow, { bg: "#feebc8", text: "#dd6b20" }, "TOMORROW", "Birthday")}
            {renderAlertCards(bdaysDayAfter, { bg: "#e2e8f0", text: "#4a5568" }, "DAY AFTER TOMORROW", "Birthday")}

            <h2 style={{ ...sectionTitleStyle, marginTop: "50px", borderBottomColor: "#e9d8fd" }}>
                🥂 Wedding Anniversaries
            </h2>
            {renderAlertCards(annivToday, { bg: "#faf5ff", text: "#6b46c1" }, "TODAY", "Anniversary")}
            {renderAlertCards(annivTomorrow, { bg: "#ebf8ff", text: "#3182ce" }, "TOMORROW", "Anniversary")}
            {renderAlertCards(annivDayAfter, { bg: "#f7fafc", text: "#718096" }, "DAY AFTER TOMORROW", "Anniversary")}
        </div>
    );
}

export default Alerts;