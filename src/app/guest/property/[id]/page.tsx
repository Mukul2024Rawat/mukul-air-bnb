// app/property/[id]/page.tsx
"use client";

import { NextPage } from "next";
import PropertyHeader from "../../../../components/guest/listing/PropertyHeader";
import PropertyGallery from "../../../../components/guest/listing/PropertyGallery";
import PropertyDetails from "../../../../components/guest/listing/PropertyDetails";
import BookingSection from "../../../../components/guest/listing/BookingSection";
import PropertyReviews from "../../../../components/guest/listing/PropertyReviews";
import PropertyLocation from "../../../../components/guest/listing/PropertyLocation";
import HostInfo from "../../../../components/guest/listing/HostingInfo";
import { samplePropertyDetails } from "../../../../utils/staticData";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fetchPropertyDetails } from "@/api/property";
import { useDispatch } from "react-redux";
import { setBookingRequestData } from "@/store/slices/Booking";
import AmenitiesList from "@/components/guest/listing/AmenitiesList";
import dynamic from "next/dynamic";
import PropertyRules from "@/components/guest/listing/PropertyRules";
import DateRangeCom from "@/components/guest/listing/DateRangeCom";
import PropertyPageSkeleton from "@/components/guest/listing/PropertyPageSkeleton";
import Reviews from "@/components/guest/listing/Review";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const PropertyMap = dynamic(
  () => import("@/components/guest/listing/PropertyMap"),
  { ssr: false }
);

interface PropertyPageProps {
  params: { id: string };
}

const PropertyPage: NextPage<PropertyPageProps> = ({ params }) => {
  const { id } = params;
  const [loading, setLoading] = useState(true);

  // api callinng

  const [propertyDetail, setPropertyDetail] = useState<any>(null);
  const dispatch = useDispatch();

  const propertyData = useSelector(
    (state: RootState) => state.bookingProperty.bookingRequestData
  );


  //hanlding date change reflection between component
  const initialDateRange = {
    from: propertyData.checkin_date
      ? new Date(propertyData.checkin_date)
      : new Date(),
    to: propertyData.checkout_date
      ? new Date(propertyData.checkout_date)
      : addDays(new Date(), 7),
  };
  
  // Assuming `DateRange` is the type for your date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange);

  useEffect(() => {
    const getPropertyDetails = async () => {
      try {
        const data = await fetchPropertyDetails(id);
        setPropertyDetail(data);
        dispatch(
          setBookingRequestData({
            property_price: parseFloat(data.property_price.price),
            daily_discount: parseFloat(data.property_price.daily_discount),
            weekly_discount: parseFloat(data.property_price.weekly_discount),
            cleaning_fee: parseFloat(data.property_price.cleaning_fee),
            service_fee: parseFloat(data.property_price.service_fee),
          })
        );
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    getPropertyDetails();
  }, []);

  useEffect(() => {
    if (propertyDetail) {
      window.scrollTo(0, 0);
    }
  }, [propertyDetail]);

  const handleDateChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) dispatch(setBookingRequestData({ checkin_date: range.from.toISOString() }));
    if (range?.to) dispatch(setBookingRequestData({ checkout_date: range.to.toISOString() }));
  }, [dispatch]);

  return (
    <div className="max-w-7xl  px-4 sm:px-6 lg:px-8 py-8 pt-[100px] md:pt-[200px] mx-auto">
      {loading ? (
        <PropertyPageSkeleton />
      ) : (
        <>
          <PropertyHeader property={propertyDetail} />
          <PropertyGallery images={propertyDetail.property_images} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PropertyDetails property={propertyDetail} />
              <div className="border-t border-gray-200 my-4"></div>
              <AmenitiesList
                propertyAmenities={propertyDetail.property_amenities}
              />
              <div className="border-t border-gray-200 my-4"></div>
              <DateRangeCom dateRange={dateRange} onDateChange={handleDateChange}/>
              <div className="border-t border-gray-200 my-4"></div>
            </div>
            <div className="lg:col-span-1">
              <BookingSection
                property_tax={propertyDetail.property_price.tax}
                property_id={id}
                dateRange={dateRange}
                onDateChange={handleDateChange}
              />
            </div>
          </div>
          <div className="div relative z-[1]">
            {propertyDetail.reviews.length > 0 && (
            <>
              <Reviews reviews={propertyDetail.reviews} propertyId={propertyDetail.id}/>
              <div className="border-t border-gray-200 my-4"></div>
            </>
          )}

            
            <div className="border-t border-gray-200 my-4"></div>

            <PropertyMap
              latitude={propertyDetail.property_address.latitude}
              longitude={propertyDetail.property_address.longitude}
              title={propertyDetail.title}
            />
            <div className="border-t border-gray-200 my-4"></div>
            <HostInfo host={propertyDetail.host} />
            <div className="border-t border-gray-200 my-4"></div>
            <PropertyRules rules={propertyDetail.property_rules[0]} />
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyPage;
