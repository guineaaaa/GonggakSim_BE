declare namespace Express {
        export interface Response {
            create(create: any): this;
            success(success: any): this;
            error(error: {
                errorCode?: string;
                reason?: string | null;
                data?: any | null;
        }): this;
    };
}