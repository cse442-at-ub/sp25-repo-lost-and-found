import React from 'react';

function LayoutDefault({ children }: { children: React.ReactNode }) {
    console.log('Rendering LayoutDefault');
    return (
        <div>
            {children} {/* Remove ResponsiveAppBar */}
        </div>
    );
}

export default LayoutDefault;