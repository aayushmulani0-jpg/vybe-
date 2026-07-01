import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import AnimatedSection from '../components/ui/AnimatedSection';
import InvoiceTemplate from '../components/orders/InvoiceTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSettingsStore } from '../store/useSettingsStore';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const [downloading, setDownloading] = useState(false);
  
  // We expect { orders: [...] } to be passed in state
  const orders = location.state?.orders || [];
  const hasOrders = orders.length > 0;
  
  // Ref to track if we've already triggered the download (to prevent double downloads in strict mode)
  const downloadTriggeredRef = useRef(false);

  useEffect(() => {
    if (hasOrders && !downloadTriggeredRef.current) {
      downloadTriggeredRef.current = true;
      generateInvoices(orders);
    }
  }, [hasOrders, orders]);

  const generateInvoices = async (orderList) => {
    setDownloading(true);
    try {
      await useSettingsStore.getState().fetchSettings();
      for (const order of orderList) {
        const elementId = `master_order_invoice_${order._id || order.id}`;
        const elementToBeCaptured = document.getElementById(elementId);
        if (!elementToBeCaptured) continue;
        
        // Wait a tiny bit for rendering
        await new Promise(res => setTimeout(res, 300));
        
        const a4Width = 595.28;
        const a4Height = 841.89;
        const dpi = 300 / 72;
        
        const contentHeight = Math.ceil(elementToBeCaptured.getBoundingClientRect().height) || 841;
        const contentWidth = Math.ceil(elementToBeCaptured.getBoundingClientRect().width) || 595;
        
        const scaleWidth = (a4Width * dpi) / contentWidth;
        const scaleHeight = (a4Height * dpi) / contentHeight;
        const scale = Math.min(scaleWidth, scaleHeight) * 0.95;
        const options = {
          scale: scale,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: "#FFFFFF",
          width: contentWidth,
          height: contentHeight,
          windowWidth: contentWidth,
          windowHeight: contentHeight,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById(elementId);
            if (clonedElement) {
              clonedElement.style.transform = "none";
              clonedElement.style.transformOrigin = "top left";
              clonedElement.style.width = `${contentWidth}px`;
              clonedElement.style.height = `${contentHeight}px`;

              clonedElement.style.fontDisplay = "swap";
              clonedElement.style.webkitFontSmoothing = "antialiased";
              clonedElement.style.mozOsxFontSmoothing = "grayscale";
              clonedElement.style.textRendering = "optimizeLegibility";

              const images = clonedElement.getElementsByTagName("img");
              Array.from(images).forEach((img) => {
                img.style.imageRendering = "high-quality";
              });
            }
          },
        };

        const canvas = await html2canvas(elementToBeCaptured, options);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
          compress: true,
          precision: 16,
        });

        const scaledWidth = contentWidth * (scale / dpi);
        const scaledHeight = contentHeight * (scale / dpi);
        const xPosition = Math.max(0, (a4Width - scaledWidth) / 2);
        const yPosition = Math.max(0, (a4Height - scaledHeight) / 2);

        pdf.addImage(
          canvas.toDataURL("image/jpeg", 1.0),
          "JPEG",
          xPosition,
          yPosition,
          scaledWidth,
          scaledHeight,
          undefined,
          "FAST",
          0,
        );

        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        const orderIdDisplay = order.id || order._id?.slice(-8) || "Receipt";
        link.download = `Invoice_${orderIdDisplay}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to capture invoice:", error);
    } finally {
      setDownloading(false);
    }
  };

  if (!hasOrders) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-heading font-bold text-white mb-4">No Order Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">It seems like you haven't placed an order recently or the session has expired.</p>
        <Button variant="accent" onClick={() => navigate('/shop')}>Return to Shop</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden pt-32">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
      
      <AnimatedSection direction="up" className="w-full max-w-lg mx-auto">
        <div className="glass-card p-10 flex flex-col items-center border-accent/20">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-white mb-4 uppercase tracking-wider">Order Successfully Placed!</h2>
          <p className="text-gray-400 mb-8">
            Thank you for shopping with {settings?.general?.storeName || 'Vybe'}. Your order is being processed. 
            {downloading ? ' Generating your invoice...' : ' Your invoice has been downloaded automatically.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button variant="outline" onClick={() => navigate('/profile')}>View Order Status</Button>
            <Button variant="accent" onClick={() => navigate('/shop')}>Continue Shopping</Button>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Hidden container for generating all invoices */}
      {orders.map((order, index) => (
        <div 
          key={index} 
          style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}
        >
          {/* We wrap InvoiceTemplate in a div with the id matching our generator logic */}
          <div id={`master_order_invoice_${order._id || order.id}`}>
            <InvoiceTemplate order={order} documentType="INVOICE" />
          </div>
        </div>
      ))}
    </div>
  );
}
