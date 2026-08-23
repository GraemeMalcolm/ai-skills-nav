---
lab:
  title: Explore Microsoft Copilot
  description: "In this exercise, you'll harness the power of Copilot to explore a new business idea: starting a corporate cleaning company using the web versions of Microsoft 365 applications."
  duration: 30 minutes
  level: 100
  islab: true
  status: released
  primarytopics:
    - Microsoft Copilot
---

# Explore Microsoft Copilot

Welcome to the exciting world of Microsoft Copilot using the web-based Microsoft 365 applications!

In this exercise, you'll harness the power of Copilot to explore a new business idea: starting a corporate cleaning company using the web versions of Microsoft 365 applications.

Imagine this: you're about to launch a top-notch cleaning service that will revolutionize office spaces everywhere. With Microsoft Copilot by your side in the web applications, you'll research market trends and develop a solid business plan. But that's not all! You'll also create compelling documents, eye-catching presentations, and persuasive emails to help get your idea off the ground and attract investors.

Get ready to unleash your creativity and business acumen as you navigate through this engaging and interactive lab using Microsoft Copilot on the web. By the end of this exercise, you'll have a comprehensive set of materials that will set you on the path to entrepreneurial success. Let's get started and make your corporate cleaning company a reality!

> **Important**: This exercise provides prompts that you can use to work with Copilot in the web versions of Microsoft 365 apps. You should use these as a *starting point* for your exploration of Copilot. You are encouraged to modify these prompts and add prompts of your own to engage in an iterative dialog with Copilot and refine the results it produces. You may not end with exactly the output that is described in the exercise instructions, but that's OK - the point is to experiment with Copilot.

This exercise should take approximately **30** minutes to complete.

> **Note**: This exercise requires a **Microsoft 365 Copilot** license and uses the web versions of Microsoft 365 applications.

## Getting Started with Microsoft 365 Web Apps

Before beginning the lab exercises, you'll need to access Microsoft 365 through the web. Use one of these primary entry points:

- **Main Portal**: [https://m365.cloud.microsoft/](https://m365.cloud.microsoft/)
- **All Apps**: [https://m365.cloud.microsoft/apps/](https://m365.cloud.microsoft/apps/)

You can also access individual applications directly using these links:
- **OneDrive**: [https://onedrive.cloud.microsoft/](https://onedrive.cloud.microsoft/)
- **Word**: [https://word.cloud.microsoft/](https://word.cloud.microsoft/)
- **Excel**: [https://excel.cloud.microsoft/](https://excel.cloud.microsoft/)
- **PowerPoint**: [https://powerpoint.cloud.microsoft/](https://powerpoint.cloud.microsoft/)
- **Outlook**: [https://outlook.office.com/](https://outlook.office.com/)

## Use Copilot to explore a document and research an idea

To start your exploration of generative AI, let's use Copilot for Word on the web to examine an existing document and extract some insights from it.

1. In a web browser, open the document [Business Idea.docx](https://github.com/MicrosoftLearning/mslearn-copilot/raw/main/Allfiles/Business%20Idea.docx) at `https://github.com/MicrosoftLearning/mslearn-copilot/raw/main/Allfiles/Business%20Idea.docx`.

1. Download the file to your **Downloads** folder.

1. Navigate to [OneDrive on the web](https://onedrive.cloud.microsoft/) at `https://onedrive.cloud.microsoft/` and select **+ Create or upload** > **Files upload**. Select the **Business Idea.docx** document from your **Downloads** folder, and then select **Open** to upload the document.

1. Open the **Business Idea.docx** document in **Microsoft Word on the web**. You can open the document directly from your OneDrive by selecting the document (closing any welcome messages or notifications of new features) or by navigating to [Microsoft Word on the web](https://word.cloud.microsoft/) at `https://word.cloud.microsoft/`. Review the document, which describes some high-level ideas for a cleaning business in New York City. If the document opens in viewing mode, select **Editing** in the upper-right corner to switch to editing mode.

   > **Tip**: You can close the **Navigation** pane if it is open to see more of the document.

1. Find and select the **Copilot** icon on the bottom right of Word to open the **Copilot** pane, as shown here (your visual theme may vary):

    ![Screenshot of the Copilot icon in Microsoft Word.](./media/copilot-word-pane-revised.png)

1. Make sure the drop-down above the Copilot prompt box is set to **Allow editing**.

1. In the Copilot pane, enter the following prompt in the text area at the bottom:

    ```prompt
    Summarize this document into 5 key points, and suggest next steps.
    ```

1. Review the response from Copilot, which should summarize the main points in the document, as shown here:

    ![Screenshot of the Copilot pane in Word with a response.](./media/copilot-response-word.png)

    > **Note**: The specific response you receive may vary due to the nature of generative AI.

    Hopefully, Copilot has provided some useful guidance. However, if you have additional questions, you can just ask for more specific information.

1. Return to the **Copilot** pane to ask Copilot the following question:

    ```prompt
    How do I set up a new business in New York? Answer with a numbered list.
    ```

1. Review the response and follow up with additional questions as needed. When you're happy with the response, copy it to the clipboard. Paste it into the Word document after the existing text. Then, select the text that provides a list of things to do when setting up a business in New York. Select **Edit with Copilot** from the toolbar that appears, then enter `Visualize as a table` and submit the prompt.

    ![Screenshot asking Copilot to visualize in a table format.](./media/copilot-rewrite-as-table.png)

1. Review the table and ask Copilot to add more information, such as a column with references for more details. Your response should look similar to the following:

    ![Screenshot of the response from Copilot in a table format.](./media/copilot-rewrite-as-table-response.png)

    > **Important**: The AI-generated response is based on information publicly on the Web. While it may be useful to help you understand the steps required to set up a business, it is not guaranteed to be 100% accurate and does not replace the need for professional advice!

1. When you're happy with the table that Copilot has generated, select **Done** to keep the changes.

## Use Copilot to create content for a business plan

Now that you've done some initial research, let's have Copilot help you develop a business plan for your cleaning company using Word on the web.

1. With the **Business Idea.docx** document still open in Word on the web, in the **Copilot** pane, enter the following prompt:

    ```prompt
    Can you suggest a name for my cleaning business?
    ```

1. Review the suggestions and select a name for your cleaning company (or continue prompting for more suggestions until you find a name you like).

1. Create a new blank document by navigating to [Microsoft Word on the web](https://word.cloud.microsoft/) at `https://word.cloud.microsoft/` and selecting **Create blank document**. Then, in the new document, enter the following prompt in the Copilot draft box, replacing **Contoso Cleaning** with the company name of your choice:

    ```prompt
    Write a business plan for "Contoso Cleaning" based on the information in /Business Idea.docx. Include an executive summary, market overview, and financial projections.
    ```

    ![Screenshot of the Copilot drafting a business plan.](./media/copilot-draft-business-plan-prompt.png)

    > **Tip**: Type the prompt, and when you type `/` Copilot should enable you to browse the documents in your OneDrive, including Business Idea.docx. Alternatively, select **+** below the prompt box and choose the document from OneDrive. If Copilot does not suggest any documents, it may be because your OneDrive has not yet been fully indexed. In this case, modify the prompt to `Write a business plan for "Contoso Cleaning", a commercial cleaning business in New York. Include an executive summary, market overview, and financial projections.`.

1. Generate and review the response. Continue working with Copilot until you're happy with the business plan. You can adjust the tone, change the length, or ask Copilot to rewrite sections as needed. Apply appropriate headings and styling to your document to make it look professional. When you're satisfied with the result, select **Done**, then save the document as **Business Plan.docx** in your OneDrive folder. Your document should look similar to the following:

    ![Screenshot of a Word document with a Copilot-generated business plan.](./media/copilot-draft-business-plan-response.png)

## Visualize financial projections in Copilot for Excel

With a business plan in hand, let's take some of that data on financial projections and ask Copilot in Excel on the web to visualize that data for us, so we can include it in emails or presentations to investors.

1. With the **Business Plan** document open in Microsoft Word on the web, open the **Copilot** pane.

1. If the business plan already includes a table of projected profits or financial projections, copy the table to your clipboard. Otherwise, enter the following prompt:

    ```prompt
   Create a table of projected profits for the next 5 years, starting with this year. The profit this year should be $10,000 and it should increase by 12% each year.
    ```

1. Copy the table of projected profits to the clipboard.

1. Open [Microsoft Excel on the web](https://excel.cloud.microsoft/) at `https://excel.cloud.microsoft/` and create a new blank workbook. Immediately save the workbook as **Financial Projections.xlsx** to your OneDrive folder.

1. Paste the table of profit projections into the Excel spreadsheet and **format it as a table**. To do this:
    1. Select a **cell** within your data.
    1. Select **Home** and choose **Format as Table** under Styles. 
    1. Choose a style for your table.
    1. In the **Format As Table** dialog box, check **My table has headers** and select **OK**.
1. With your sales projections formatted as a table, open the **Copilot** pane from the bottom right of Excel, confirm the drop-down above the Copilot prompt box is set to **Allow editing**, and then enter the following prompt:

    ```prompt
    Suggest ways to visualize these financial projections.
    ```
    
1. Copilot should create a new sheet and add a chart to visualize the financial projections.

    ![Screenshot of Copilot in Excel visualizing financial projections.](./media/copilot-excel-visualize-projections.png)

    > **Tip**: If Copilot suggests a different format for the data, enter the follow-on prompt `Visualize the data as a line chart.`.

1. Select the chart and then select the **Chart** tab to apply styles, change the chart type and other actions. If Copilot created more than one chart, you can repeat this for each one. At the end, you should have something that resembles this:

    ![Screenshot of Copilot in Excel adding a PivotChart.](./media/copilot-excel-chart-design.png)

1. Close the Excel web tab. Your workbook is saved automatically.

## Use Copilot to create content for a presentation

With Copilot's help, you've created a draft of a business plan for the cleaning business idea and prepared some financial projections. Now you'll need an effective presentation to communicate the benefits of your business using PowerPoint on the web.

1. Open [Microsoft PowerPoint for the web](https://powerpoint.cloud.microsoft/) at `https://powerpoint.cloud.microsoft/` and create a new **blank presentation**. If the **Designer** pane opens automatically, close it.

1. Rename the presentation to **Cleaning Company.pptx** in the title bar.

1. Select the **Copilot** icon in the bottom right of the PowerPoint, and make sure the drop-down above the Copilot prompt box is set to **Allow editing**. Select **Create presentation about topic**, then complete the prompt in the Copilot pane as follows:

    ```prompt
    Create a presentation about a corporate cleaning service named "Contoso Cleaning" in New York City. The presentation should include the benefits of using a professional cleaning business.
    ```

    > **Note:** Replace **Contoso Cleaning** with the company name you chose earlier.

    > **Tip:** To help Copilot generate a presentation based on the work you completed earlier, you can optionally attach **Business Plan.docx** and **Financial Projections.xlsx** using the **+**(Add content) option or by typing **/** and selecting the files from OneDrive.

1. Copilot may ask questions about the presentation, such as the visual style or look you want for the deck. You can respond with your preferences or select **Skip all** to let Copilot decide.

    ![Screenshot of Copilot in PowerPoint on the web asking clarification questions to generate a presentation](./media/copilot-generate-slides.png)

1. Copilot will generate slides in the presentation. The process may take several minutes and your output should look something like this with a different theme:

    ![Screenshot of PowerPoint presentation created by Copilot from a Word document.](./media/generate-slides-copilot.png)

1. Select the second-last slide in the presentation. Then, in the **Copilot** pane, enter the following prompt:

    ```prompt
    Add a slide about the benefits of an eco-friendly approach to cleaning.
    ```

    ![Screenshot of PowerPoint presentation with a new slide.](./media/copilot-powerpoint-add-new-slide.png)

1. Close the PowerPoint web tab. The presentation is saved automatically to your OneDrive folder.

## Use Copilot to arrange a funding meeting

You've created some collateral to help you get your business started. Now it's time to reach out to an investor seeking some startup funding using Outlook on the web.

1. Open [Microsoft Outlook on the web](https://outlook.office.com/) at `https://outlook.office.com/`. Then, select the **Copilot** icon in the upper-right corner to open the **Copilot** pane.

1. In the left navigation, select **Calendar** and change the view to **Work week** if it isn't already selected. If you don't already have any scheduled events in your calendar for this week, you can add a couple so that Copilot has some information to work with.

1. In the Copilot pane, enter the following prompt:

    ```
    What events do I have scheduled this week?
    ```

    Copilot should respond with a summary of your scheduled events for the week - helping you identify availability for a meeting with a bank manager to arrange startup funding.

1. Switch to the **Mail** page, create a new email, and fill in the **To** box with your own email address.

1. In the message body, select the **Open Copilot** icon to open the Copilot drafting experience.

    ![Screenshot of Outlook and the option to draft an email with Copilot.](./media/copilot-draft-email-outlook.png)
    
1. Enter the following prompt to generate a draft email:

    ```prompt
    Write an email to a bank manager requesting a meeting to discuss funding for a commercial cleaning business. The email should be concise and the tone should be professional.
    ```

1. Use Copilot to refine the email content, and then select **Keep it** to finalize the message.

    ![Screenshot of drafting an email with Copilot in Outlook.](./media/copilot-draft-email-adjust-tone-outlook.png)

1. You can send the email to yourself if you wish!

## Challenge

Now you've seen how to use Microsoft Copilot in the web applications to research ideas and generate content, why not try exploring further? 

Based on what you've learned in this exercise, try using Copilot in the web versions of Microsoft 365 apps to plan a meeting in which you'll propose the adoption of generative AI in your organization. Here are a few ideas to get you started:

- Research the benefits of generative AI and Microsoft Copilot for businesses, finding information about productivity benefits, cost-savings, and examples of organizations that have already successfully adopted AI.
- Create a discussion document using Word on the web that you can circulate as pre-reading before the meeting.
- Create a presentation using PowerPoint on the web that you can use to present your case, including data and visualizations to emphasize key elements of your pitch.
- Compose an email using Outlook on the web to tell your coworkers about the meeting and provide some context for it.

Be as inventive as you like, and explore how Copilot can help you by finding information, generating and refining text, creating images, and answering questions - all within the web-based Microsoft 365 environment.

## Conclusion

In this exercise, you've used [Microsoft Copilot](https://www.microsoft.com/microsoft-365/enterprise/copilot-for-microsoft-365) in the web versions of Microsoft 365 applications to find information and generate content. Hopefully you've seen how using generative AI in a copilot can help with productivity and creativity, even when working entirely within web browsers. Microsoft 365 web apps enable you to bring the power of generative AI to your business data and processes while providing the flexibility to work from anywhere with internet access, ensuring a manageable, secure, cloud-based solution.