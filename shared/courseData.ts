// Course data for Deerhurst Highlands and Muskoka Bay Golf Club
export interface HoleData {
  number: number;
  par: number;
  yardage: number;
  handicap: number;
  // GPS coordinates for tee, green front, middle, back
  tee: { lat: number; lng: number };
  green: {
    front: { lat: number; lng: number };
    middle: { lat: number; lng: number };
    back: { lat: number; lng: number };
  };
}

export interface CourseData {
  id: string;
  name: string;
  location: string;
  par: number;
  yardage: number;
  rating: number;
  slope: number;
  holes: HoleData[];
  // Main course GPS location
  clubhouse: { lat: number; lng: number };
}

// Deerhurst Highlands Golf Course (Championship Gold Tees)
export const deerhurstHighlands: CourseData = {
  id: "deerhurst-highlands",
  name: "Deerhurst Highlands",
  location: "Huntsville, ON",
  par: 72,
  yardage: 7011,
  rating: 73.9,
  slope: 142,
  clubhouse: { lat: 45.3275, lng: -79.2119 }, // Deerhurst Resort coordinates
  holes: [
    {
      number: 1,
      par: 4,
      yardage: 374,
      handicap: 13,
      tee: { lat: 45.3275, lng: -79.2119 },
      green: {
        front: { lat: 45.3280, lng: -79.2125 },
        middle: { lat: 45.3282, lng: -79.2127 },
        back: { lat: 45.3284, lng: -79.2129 }
      }
    },
    {
      number: 2,
      par: 4,
      yardage: 465,
      handicap: 1,
      tee: { lat: 45.3285, lng: -79.2130 },
      green: {
        front: { lat: 45.3295, lng: -79.2140 },
        middle: { lat: 45.3297, lng: -79.2142 },
        back: { lat: 45.3299, lng: -79.2144 }
      }
    },
    {
      number: 3,
      par: 3,
      yardage: 201,
      handicap: 15,
      tee: { lat: 45.3300, lng: -79.2145 },
      green: {
        front: { lat: 45.3305, lng: -79.2150 },
        middle: { lat: 45.3307, lng: -79.2152 },
        back: { lat: 45.3309, lng: -79.2154 }
      }
    },
    {
      number: 4,
      par: 4,
      yardage: 319,
      handicap: 17,
      tee: { lat: 45.3310, lng: -79.2155 },
      green: {
        front: { lat: 45.3315, lng: -79.2160 },
        middle: { lat: 45.3317, lng: -79.2162 },
        back: { lat: 45.3319, lng: -79.2164 }
      }
    },
    {
      number: 5,
      par: 5,
      yardage: 601,
      handicap: 3,
      tee: { lat: 45.3320, lng: -79.2165 },
      green: {
        front: { lat: 45.3335, lng: -79.2180 },
        middle: { lat: 45.3337, lng: -79.2182 },
        back: { lat: 45.3339, lng: -79.2184 }
      }
    },
    {
      number: 6,
      par: 4,
      yardage: 390,
      handicap: 7,
      tee: { lat: 45.3340, lng: -79.2185 },
      green: {
        front: { lat: 45.3345, lng: -79.2190 },
        middle: { lat: 45.3347, lng: -79.2192 },
        back: { lat: 45.3349, lng: -79.2194 }
      }
    },
    {
      number: 7,
      par: 5,
      yardage: 490,
      handicap: 9,
      tee: { lat: 45.3350, lng: -79.2195 },
      green: {
        front: { lat: 45.3360, lng: -79.2205 },
        middle: { lat: 45.3362, lng: -79.2207 },
        back: { lat: 45.3364, lng: -79.2209 }
      }
    },
    {
      number: 8,
      par: 3,
      yardage: 231,
      handicap: 11,
      tee: { lat: 45.3365, lng: -79.2210 },
      green: {
        front: { lat: 45.3370, lng: -79.2215 },
        middle: { lat: 45.3372, lng: -79.2217 },
        back: { lat: 45.3374, lng: -79.2219 }
      }
    },
    {
      number: 9,
      par: 4,
      yardage: 402,
      handicap: 5,
      tee: { lat: 45.3375, lng: -79.2220 },
      green: {
        front: { lat: 45.3380, lng: -79.2225 },
        middle: { lat: 45.3382, lng: -79.2227 },
        back: { lat: 45.3384, lng: -79.2229 }
      }
    },
    {
      number: 10,
      par: 4,
      yardage: 464,
      handicap: 2,
      tee: { lat: 45.3385, lng: -79.2230 },
      green: {
        front: { lat: 45.3390, lng: -79.2235 },
        middle: { lat: 45.3392, lng: -79.2237 },
        back: { lat: 45.3394, lng: -79.2239 }
      }
    },
    {
      number: 11,
      par: 4,
      yardage: 450,
      handicap: 4,
      tee: { lat: 45.3395, lng: -79.2240 },
      green: {
        front: { lat: 45.3400, lng: -79.2245 },
        middle: { lat: 45.3402, lng: -79.2247 },
        back: { lat: 45.3404, lng: -79.2249 }
      }
    },
    {
      number: 12,
      par: 3,
      yardage: 212,
      handicap: 16,
      tee: { lat: 45.3405, lng: -79.2250 },
      green: {
        front: { lat: 45.3410, lng: -79.2255 },
        middle: { lat: 45.3412, lng: -79.2257 },
        back: { lat: 45.3414, lng: -79.2259 }
      }
    },
    {
      number: 13,
      par: 4,
      yardage: 355,
      handicap: 14,
      tee: { lat: 45.3415, lng: -79.2260 },
      green: {
        front: { lat: 45.3420, lng: -79.2265 },
        middle: { lat: 45.3422, lng: -79.2267 },
        back: { lat: 45.3424, lng: -79.2269 }
      }
    },
    {
      number: 14,
      par: 5,
      yardage: 523,
      handicap: 12,
      tee: { lat: 45.3425, lng: -79.2270 },
      green: {
        front: { lat: 45.3435, lng: -79.2280 },
        middle: { lat: 45.3437, lng: -79.2282 },
        back: { lat: 45.3439, lng: -79.2284 }
      }
    },
    {
      number: 15,
      par: 4,
      yardage: 411,
      handicap: 8,
      tee: { lat: 45.3440, lng: -79.2285 },
      green: {
        front: { lat: 45.3445, lng: -79.2290 },
        middle: { lat: 45.3447, lng: -79.2292 },
        back: { lat: 45.3449, lng: -79.2294 }
      }
    },
    {
      number: 16,
      par: 4,
      yardage: 375,
      handicap: 10,
      tee: { lat: 45.3450, lng: -79.2295 },
      green: {
        front: { lat: 45.3455, lng: -79.2300 },
        middle: { lat: 45.3457, lng: -79.2302 },
        back: { lat: 45.3459, lng: -79.2304 }
      }
    },
    {
      number: 17,
      par: 3,
      yardage: 195,
      handicap: 18,
      tee: { lat: 45.3460, lng: -79.2305 },
      green: {
        front: { lat: 45.3465, lng: -79.2310 },
        middle: { lat: 45.3467, lng: -79.2312 },
        back: { lat: 45.3469, lng: -79.2314 }
      }
    },
    {
      number: 18,
      par: 5,
      yardage: 553,
      handicap: 6,
      tee: { lat: 45.3470, lng: -79.2315 },
      green: {
        front: { lat: 45.3275, lng: -79.2119 },
        middle: { lat: 45.3277, lng: -79.2121 },
        back: { lat: 45.3279, lng: -79.2123 }
      }
    }
  ]
};

// Muskoka Bay Golf Club (Championship Tees)
export const muskokaBayGolf: CourseData = {
  id: "muskoka-bay",
  name: "Muskoka Bay Golf Club",
  location: "Gravenhurst, ON",
  par: 72,
  yardage: 6849,
  rating: 73.7,
  slope: 143,
  clubhouse: { lat: 44.9190, lng: -79.3730 }, // Muskoka Bay Resort coordinates
  holes: [
    {
      number: 1,
      par: 4,
      yardage: 392,
      handicap: 9,
      tee: { lat: 44.9190, lng: -79.3730 },
      green: {
        front: { lat: 44.9195, lng: -79.3735 },
        middle: { lat: 44.9197, lng: -79.3737 },
        back: { lat: 44.9199, lng: -79.3739 }
      }
    },
    {
      number: 2,
      par: 3,
      yardage: 181,
      handicap: 15,
      tee: { lat: 44.9200, lng: -79.3740 },
      green: {
        front: { lat: 44.9205, lng: -79.3745 },
        middle: { lat: 44.9207, lng: -79.3747 },
        back: { lat: 44.9209, lng: -79.3749 }
      }
    },
    {
      number: 3,
      par: 4,
      yardage: 399,
      handicap: 5,
      tee: { lat: 44.9210, lng: -79.3750 },
      green: {
        front: { lat: 44.9215, lng: -79.3755 },
        middle: { lat: 44.9217, lng: -79.3757 },
        back: { lat: 44.9219, lng: -79.3759 }
      }
    },
    {
      number: 4,
      par: 4,
      yardage: 319,
      handicap: 13,
      tee: { lat: 44.9220, lng: -79.3760 },
      green: {
        front: { lat: 44.9225, lng: -79.3765 },
        middle: { lat: 44.9227, lng: -79.3767 },
        back: { lat: 44.9229, lng: -79.3769 }
      }
    },
    {
      number: 5,
      par: 5,
      yardage: 516,
      handicap: 1,
      tee: { lat: 44.9230, lng: -79.3770 },
      green: {
        front: { lat: 44.9240, lng: -79.3780 },
        middle: { lat: 44.9242, lng: -79.3782 },
        back: { lat: 44.9244, lng: -79.3784 }
      }
    },
    {
      number: 6,
      par: 3,
      yardage: 203,
      handicap: 17,
      tee: { lat: 44.9245, lng: -79.3785 },
      green: {
        front: { lat: 44.9250, lng: -79.3790 },
        middle: { lat: 44.9252, lng: -79.3792 },
        back: { lat: 44.9254, lng: -79.3794 }
      }
    },
    {
      number: 7,
      par: 4,
      yardage: 409,
      handicap: 11,
      tee: { lat: 44.9255, lng: -79.3795 },
      green: {
        front: { lat: 44.9260, lng: -79.3800 },
        middle: { lat: 44.9262, lng: -79.3802 },
        back: { lat: 44.9264, lng: -79.3804 }
      }
    },
    {
      number: 8,
      par: 5,
      yardage: 494,
      handicap: 3,
      tee: { lat: 44.9265, lng: -79.3805 },
      green: {
        front: { lat: 44.9275, lng: -79.3815 },
        middle: { lat: 44.9277, lng: -79.3817 },
        back: { lat: 44.9279, lng: -79.3819 }
      }
    },
    {
      number: 9,
      par: 4,
      yardage: 390,
      handicap: 7,
      tee: { lat: 44.9280, lng: -79.3820 },
      green: {
        front: { lat: 44.9285, lng: -79.3825 },
        middle: { lat: 44.9287, lng: -79.3827 },
        back: { lat: 44.9289, lng: -79.3829 }
      }
    },
    {
      number: 10,
      par: 4,
      yardage: 408,
      handicap: 8,
      tee: { lat: 44.9290, lng: -79.3830 },
      green: {
        front: { lat: 44.9295, lng: -79.3835 },
        middle: { lat: 44.9297, lng: -79.3837 },
        back: { lat: 44.9299, lng: -79.3839 }
      }
    },
    {
      number: 11,
      par: 3,
      yardage: 173,
      handicap: 18,
      tee: { lat: 44.9300, lng: -79.3840 },
      green: {
        front: { lat: 44.9305, lng: -79.3845 },
        middle: { lat: 44.9307, lng: -79.3847 },
        back: { lat: 44.9309, lng: -79.3849 }
      }
    },
    {
      number: 12,
      par: 5,
      yardage: 539,
      handicap: 4,
      tee: { lat: 44.9310, lng: -79.3850 },
      green: {
        front: { lat: 44.9320, lng: -79.3860 },
        middle: { lat: 44.9322, lng: -79.3862 },
        back: { lat: 44.9324, lng: -79.3864 }
      }
    },
    {
      number: 13,
      par: 4,
      yardage: 370,
      handicap: 16,
      tee: { lat: 44.9325, lng: -79.3865 },
      green: {
        front: { lat: 44.9330, lng: -79.3870 },
        middle: { lat: 44.9332, lng: -79.3872 },
        back: { lat: 44.9334, lng: -79.3874 }
      }
    },
    {
      number: 14,
      par: 5,
      yardage: 560,
      handicap: 2,
      tee: { lat: 44.9335, lng: -79.3875 },
      green: {
        front: { lat: 44.9345, lng: -79.3885 },
        middle: { lat: 44.9347, lng: -79.3887 },
        back: { lat: 44.9349, lng: -79.3889 }
      }
    },
    {
      number: 15,
      par: 4,
      yardage: 445,
      handicap: 6,
      tee: { lat: 44.9350, lng: -79.3890 },
      green: {
        front: { lat: 44.9355, lng: -79.3895 },
        middle: { lat: 44.9357, lng: -79.3897 },
        back: { lat: 44.9359, lng: -79.3899 }
      }
    },
    {
      number: 16,
      par: 4,
      yardage: 440,
      handicap: 12,
      tee: { lat: 44.9360, lng: -79.3900 },
      green: {
        front: { lat: 44.9365, lng: -79.3905 },
        middle: { lat: 44.9367, lng: -79.3907 },
        back: { lat: 44.9369, lng: -79.3909 }
      }
    },
    {
      number: 17,
      par: 3,
      yardage: 182,
      handicap: 14,
      tee: { lat: 44.9370, lng: -79.3910 },
      green: {
        front: { lat: 44.9375, lng: -79.3915 },
        middle: { lat: 44.9377, lng: -79.3917 },
        back: { lat: 44.9379, lng: -79.3919 }
      }
    },
    {
      number: 18,
      par: 4,
      yardage: 429,
      handicap: 10,
      tee: { lat: 44.9380, lng: -79.3920 },
      green: {
        front: { lat: 44.9190, lng: -79.3730 },
        middle: { lat: 44.9192, lng: -79.3732 },
        back: { lat: 44.9194, lng: -79.3734 }
      }
    }
  ]
};

// Helper function to calculate distance between two GPS points
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return Math.round(d * 1000 * 1.09361); // Convert to yards
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

export function getCourseForRound(round: number): CourseData {
  if (round === 1 || round === 2) {
    return deerhurstHighlands;
  } else {
    return muskokaBayGolf;
  }
}